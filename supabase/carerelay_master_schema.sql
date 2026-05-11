-- =============================================================================
-- CareRelay Supabase Master Schema
-- =============================================================================
-- Purpose:
--   Complete, idempotent, production-oriented PostgreSQL schema for CareRelay.
--   Safe for repeated CI/CD execution against Supabase projects.
--
-- Source model:
--   Reconstructed from application routes, TypeScript model types, Supabase
--   access helpers, and historical migrations.
--
-- Supabase notes:
--   - Public tables receive explicit GRANT statements for PostgREST/Data API.
--   - RLS is enabled on every public application table.
--   - App-server/service-role code may bypass RLS for webhook/SMS ingestion.
-- =============================================================================

begin;

set local check_function_bodies = off;

-- =============================================================================
-- 00. Extensions
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

create schema if not exists app_private;

-- =============================================================================
-- 01. Shared Helpers
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function app_private.care_circle_ids_for_user(user_uuid uuid)
returns table(care_circle_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select cc.id
  from public.care_circles cc
  where cc.owner_id = user_uuid
  union
  select fm.care_circle_id
  from public.family_members fm
  where fm.user_id = user_uuid
    and fm.care_circle_id is not null
$$;

revoke all on function app_private.care_circle_ids_for_user(uuid) from public;
grant usage on schema app_private to authenticated, service_role;
grant execute on function app_private.care_circle_ids_for_user(uuid) to authenticated, service_role;

create or replace function app_private.is_care_circle_owner(circle_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.care_circles cc
    where cc.id = circle_uuid
      and cc.owner_id = auth.uid()
  )
$$;

revoke all on function app_private.is_care_circle_owner(uuid) from public;
grant execute on function app_private.is_care_circle_owner(uuid) to authenticated, service_role;

create or replace function app_private.is_care_circle_member(circle_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from app_private.care_circle_ids_for_user(auth.uid()) allowed
    where allowed.care_circle_id = circle_uuid
  )
$$;

revoke all on function app_private.is_care_circle_member(uuid) from public;
grant execute on function app_private.is_care_circle_member(uuid) to authenticated, service_role;

create or replace function app_private.is_care_circle_admin(circle_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.care_circles cc
    where cc.id = circle_uuid
      and cc.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.family_members fm
    where fm.care_circle_id = circle_uuid
      and fm.user_id = auth.uid()
      and (
        fm.permission_level = 'admin'
        or fm.role in ('owner', 'admin')
      )
  )
$$;

revoke all on function app_private.is_care_circle_admin(uuid) from public;
grant execute on function app_private.is_care_circle_admin(uuid) to authenticated, service_role;

create or replace function public.ensure_column(
  target_table regclass,
  column_name text,
  column_definition text
)
returns void
language plpgsql
as $$
begin
  if not exists (
    select 1
    from pg_attribute
    where attrelid = target_table
      and attname = column_name
      and not attisdropped
  ) then
    execute format('alter table %s add column %I %s', target_table, column_name, column_definition);
  end if;
end;
$$;

-- =============================================================================
-- 02. Tables
-- =============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  phone_normalized text,
  timezone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.care_circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  sms_keyword text,
  shared_phone_number text,
  demo_mode boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.care_recipients (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid not null references public.care_circles(id) on delete cascade,
  first_name text not null,
  relationship text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid not null references public.care_circles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text,
  phone_normalized text,
  role text default 'member',
  invite_status text default 'pending',
  permission_level text default 'contributor',
  joined_at timestamptz,
  opted_out_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.inbound_messages (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid not null references public.care_circles(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  sender_name text,
  sender_phone text,
  sender_phone_normalized text,
  raw_body text not null,
  cleaned_body text,
  sms_keyword_used text,
  category text default 'general_update',
  confidence numeric(5,4),
  concern_flag boolean default false,
  matched_keywords text[] default '{}',
  parsed_payload jsonb default '{}'::jsonb,
  source text default 'sms',
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid not null references public.care_circles(id) on delete cascade,
  inbound_message_id uuid references public.inbound_messages(id) on delete set null,
  title text not null,
  details text,
  status text default 'open',
  assigned_to uuid references public.family_members(id) on delete set null,
  due_at timestamptz,
  completed_by uuid references public.family_members(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid not null references public.care_circles(id) on delete cascade,
  inbound_message_id uuid references public.inbound_messages(id) on delete set null,
  title text not null,
  details text,
  appointment_at timestamptz,
  status text default 'upcoming',
  transportation_confirmed boolean default false,
  assigned_driver uuid references public.family_members(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.supplies (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid not null references public.care_circles(id) on delete cascade,
  inbound_message_id uuid references public.inbound_messages(id) on delete set null,
  title text not null,
  details text,
  status text default 'needed',
  requested_by uuid references public.family_members(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid not null references public.care_circles(id) on delete cascade,
  inbound_message_id uuid references public.inbound_messages(id) on delete set null,
  medication_name text,
  confirmation_text text not null,
  given_by text,
  logged_at timestamptz default now(),
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.concerns (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid not null references public.care_circles(id) on delete cascade,
  inbound_message_id uuid references public.inbound_messages(id) on delete set null,
  title text not null,
  details text,
  severity text default 'family_review',
  status text default 'open',
  acknowledged_by text,
  acknowledged_at timestamptz,
  acknowledgement_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.daily_summaries (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid not null references public.care_circles(id) on delete cascade,
  summary_date date not null,
  summary_text text not null,
  source text default 'deterministic',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid not null references public.care_circles(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  type text,
  title text,
  body text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  care_circle_id uuid references public.care_circles(id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan_id text not null default 'free',
  status text not null default 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.subscription_tiers (
  plan_id text primary key,
  display_name text not null,
  monthly_price_cents integer not null default 0,
  max_care_circles integer not null default 1,
  max_family_members integer not null default 3,
  daily_summaries boolean not null default true,
  weekly_summaries boolean not null default false,
  export_timeline boolean not null default false,
  multiple_care_circles boolean not null default false,
  admin_dashboard boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Legacy billing compatibility table from earlier migrations. Kept to avoid
-- destructive drift for projects already carrying this table.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references public.care_circles(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  plan text default 'starter',
  status text default 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================================================
-- 03. Idempotent Schema Drift Repair
-- =============================================================================

select public.ensure_column('public.profiles', 'email', 'text');
select public.ensure_column('public.profiles', 'full_name', 'text');
select public.ensure_column('public.profiles', 'phone', 'text');
select public.ensure_column('public.profiles', 'phone_normalized', 'text');
select public.ensure_column('public.profiles', 'timezone', 'text');
select public.ensure_column('public.profiles', 'created_at', 'timestamptz default now()');
select public.ensure_column('public.profiles', 'updated_at', 'timestamptz default now()');

select public.ensure_column('public.care_circles', 'owner_id', 'uuid references auth.users(id) on delete cascade');
select public.ensure_column('public.care_circles', 'sms_keyword', 'text');
select public.ensure_column('public.care_circles', 'shared_phone_number', 'text');
select public.ensure_column('public.care_circles', 'demo_mode', 'boolean default false');
select public.ensure_column('public.care_circles', 'updated_at', 'timestamptz default now()');

select public.ensure_column('public.family_members', 'name', 'text');
select public.ensure_column('public.family_members', 'care_circle_id', 'uuid references public.care_circles(id) on delete cascade');
select public.ensure_column('public.family_members', 'user_id', 'uuid references auth.users(id) on delete set null');
select public.ensure_column('public.family_members', 'phone', 'text');
select public.ensure_column('public.family_members', 'phone_normalized', 'text');
select public.ensure_column('public.family_members', 'role', 'text default ''member''');
select public.ensure_column('public.family_members', 'invite_status', 'text default ''pending''');
select public.ensure_column('public.family_members', 'permission_level', 'text default ''contributor''');
select public.ensure_column('public.family_members', 'created_at', 'timestamptz default now()');
select public.ensure_column('public.family_members', 'joined_at', 'timestamptz');
select public.ensure_column('public.family_members', 'opted_out_at', 'timestamptz');
select public.ensure_column('public.family_members', 'last_active_at', 'timestamptz');
select public.ensure_column('public.family_members', 'updated_at', 'timestamptz default now()');

select public.ensure_column('public.inbound_messages', 'care_circle_id', 'uuid references public.care_circles(id) on delete cascade');
select public.ensure_column('public.inbound_messages', 'family_member_id', 'uuid references public.family_members(id) on delete set null');
select public.ensure_column('public.inbound_messages', 'sender_name', 'text');
select public.ensure_column('public.inbound_messages', 'sender_phone', 'text');
select public.ensure_column('public.inbound_messages', 'sender_phone_normalized', 'text');
select public.ensure_column('public.inbound_messages', 'raw_body', 'text');
select public.ensure_column('public.inbound_messages', 'cleaned_body', 'text');
select public.ensure_column('public.inbound_messages', 'sms_keyword_used', 'text');
select public.ensure_column('public.inbound_messages', 'category', 'text default ''general_update''');
select public.ensure_column('public.inbound_messages', 'confidence', 'numeric(5,4)');
select public.ensure_column('public.inbound_messages', 'concern_flag', 'boolean default false');
select public.ensure_column('public.inbound_messages', 'matched_keywords', 'text[] default ''{}''');
select public.ensure_column('public.inbound_messages', 'parsed_payload', 'jsonb default ''{}''::jsonb');
select public.ensure_column('public.inbound_messages', 'source', 'text default ''sms''');
select public.ensure_column('public.inbound_messages', 'created_at', 'timestamptz default now()');

select public.ensure_column('public.tasks', 'inbound_message_id', 'uuid references public.inbound_messages(id) on delete set null');
select public.ensure_column('public.tasks', 'details', 'text');
select public.ensure_column('public.tasks', 'assigned_to', 'uuid references public.family_members(id) on delete set null');
select public.ensure_column('public.tasks', 'due_at', 'timestamptz');
select public.ensure_column('public.tasks', 'completed_by', 'uuid references public.family_members(id) on delete set null');
select public.ensure_column('public.tasks', 'completed_at', 'timestamptz');
select public.ensure_column('public.tasks', 'updated_at', 'timestamptz default now()');

select public.ensure_column('public.appointments', 'inbound_message_id', 'uuid references public.inbound_messages(id) on delete set null');
select public.ensure_column('public.appointments', 'details', 'text');
select public.ensure_column('public.appointments', 'appointment_at', 'timestamptz');
select public.ensure_column('public.appointments', 'status', 'text default ''upcoming''');
select public.ensure_column('public.appointments', 'transportation_confirmed', 'boolean default false');
select public.ensure_column('public.appointments', 'assigned_driver', 'uuid references public.family_members(id) on delete set null');
select public.ensure_column('public.appointments', 'updated_at', 'timestamptz default now()');

select public.ensure_column('public.supplies', 'inbound_message_id', 'uuid references public.inbound_messages(id) on delete set null');
select public.ensure_column('public.supplies', 'title', 'text');
select public.ensure_column('public.supplies', 'details', 'text');
select public.ensure_column('public.supplies', 'requested_by', 'uuid references public.family_members(id) on delete set null');
select public.ensure_column('public.supplies', 'updated_at', 'timestamptz default now()');

select public.ensure_column('public.medication_logs', 'inbound_message_id', 'uuid references public.inbound_messages(id) on delete set null');
select public.ensure_column('public.medication_logs', 'given_by', 'text');
select public.ensure_column('public.medication_logs', 'logged_at', 'timestamptz default now()');
select public.ensure_column('public.medication_logs', 'notes', 'text');

select public.ensure_column('public.concerns', 'inbound_message_id', 'uuid references public.inbound_messages(id) on delete set null');
select public.ensure_column('public.concerns', 'title', 'text');
select public.ensure_column('public.concerns', 'details', 'text');
select public.ensure_column('public.concerns', 'severity', 'text default ''family_review''');
select public.ensure_column('public.concerns', 'status', 'text default ''open''');
select public.ensure_column('public.concerns', 'acknowledged_by', 'text');
select public.ensure_column('public.concerns', 'acknowledged_at', 'timestamptz');
select public.ensure_column('public.concerns', 'acknowledgement_note', 'text');
select public.ensure_column('public.concerns', 'updated_at', 'timestamptz default now()');

select public.ensure_column('public.daily_summaries', 'care_circle_id', 'uuid references public.care_circles(id) on delete cascade');
select public.ensure_column('public.daily_summaries', 'summary_date', 'date');
select public.ensure_column('public.daily_summaries', 'summary_text', 'text');
select public.ensure_column('public.daily_summaries', 'source', 'text default ''deterministic''');
select public.ensure_column('public.daily_summaries', 'created_at', 'timestamptz default now()');
select public.ensure_column('public.daily_summaries', 'updated_at', 'timestamptz default now()');

select public.ensure_column('public.subscription_tiers', 'display_name', 'text');
select public.ensure_column('public.subscription_tiers', 'monthly_price_cents', 'integer default 0');
select public.ensure_column('public.subscription_tiers', 'max_care_circles', 'integer default 1');
select public.ensure_column('public.subscription_tiers', 'max_family_members', 'integer default 3');
select public.ensure_column('public.subscription_tiers', 'daily_summaries', 'boolean default true');
select public.ensure_column('public.subscription_tiers', 'weekly_summaries', 'boolean default false');
select public.ensure_column('public.subscription_tiers', 'export_timeline', 'boolean default false');
select public.ensure_column('public.subscription_tiers', 'multiple_care_circles', 'boolean default false');
select public.ensure_column('public.subscription_tiers', 'admin_dashboard', 'boolean default true');
select public.ensure_column('public.subscription_tiers', 'created_at', 'timestamptz default now()');
select public.ensure_column('public.subscription_tiers', 'updated_at', 'timestamptz default now()');

-- Zero-data-loss type normalization for known drift-prone columns.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'inbound_messages'
      and column_name = 'parsed_payload'
      and data_type <> 'jsonb'
  ) then
    alter table public.inbound_messages
      alter column parsed_payload type jsonb
      using coalesce(parsed_payload::jsonb, '{}'::jsonb);
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'inbound_messages'
      and column_name = 'confidence'
      and data_type <> 'numeric'
  ) then
    alter table public.inbound_messages
      alter column confidence type numeric(5,4)
      using nullif(confidence::text, '')::numeric;
  end if;
end;
$$;

-- =============================================================================
-- 04. Defaults, Constraints, and Domain Enforcement
-- =============================================================================

alter table public.profiles
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.care_circles
  alter column id set default gen_random_uuid(),
  alter column demo_mode set default false,
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.family_members
  alter column id set default gen_random_uuid(),
  alter column role set default 'member',
  alter column invite_status set default 'pending',
  alter column permission_level set default 'contributor',
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.inbound_messages
  alter column id set default gen_random_uuid(),
  alter column category set default 'general_update',
  alter column concern_flag set default false,
  alter column matched_keywords set default '{}',
  alter column parsed_payload set default '{}'::jsonb,
  alter column source set default 'sms',
  alter column created_at set default now();

alter table public.tasks
  alter column id set default gen_random_uuid(),
  alter column status set default 'open',
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.appointments
  alter column id set default gen_random_uuid(),
  alter column status set default 'upcoming',
  alter column transportation_confirmed set default false,
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.supplies
  alter column id set default gen_random_uuid(),
  alter column status set default 'needed',
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.medication_logs
  alter column id set default gen_random_uuid(),
  alter column logged_at set default now(),
  alter column created_at set default now();

alter table public.concerns
  alter column id set default gen_random_uuid(),
  alter column severity set default 'family_review',
  alter column status set default 'open',
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.daily_summaries
  alter column id set default gen_random_uuid(),
  alter column source set default 'deterministic',
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.notifications
  alter column id set default gen_random_uuid(),
  alter column created_at set default now();

alter table public.billing_subscriptions
  alter column id set default gen_random_uuid(),
  alter column plan_id set default 'free',
  alter column status set default 'inactive',
  alter column cancel_at_period_end set default false,
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.subscription_tiers
  alter column monthly_price_cents set default 0,
  alter column max_care_circles set default 1,
  alter column max_family_members set default 3,
  alter column daily_summaries set default true,
  alter column weekly_summaries set default false,
  alter column export_timeline set default false,
  alter column multiple_care_circles set default false,
  alter column admin_dashboard set default true,
  alter column created_at set default now(),
  alter column updated_at set default now();

do $$
begin
  alter table public.profiles
    drop constraint if exists profiles_email_format_chk,
    add constraint profiles_email_format_chk
      check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') not valid;

  alter table public.care_circles
    drop constraint if exists care_circles_name_not_blank_chk,
    add constraint care_circles_name_not_blank_chk check (length(trim(name)) > 0) not valid,
    drop constraint if exists care_circles_sms_keyword_format_chk,
    add constraint care_circles_sms_keyword_format_chk
      check (sms_keyword is null or sms_keyword ~ '^[A-Z0-9_]{2,24}$') not valid;

  alter table public.family_members
    drop constraint if exists family_members_name_not_blank_chk,
    add constraint family_members_name_not_blank_chk check (length(trim(name)) > 0) not valid,
    drop constraint if exists family_members_role_chk,
    add constraint family_members_role_chk check (role in ('owner', 'member', 'caregiver', 'admin')) not valid,
    drop constraint if exists family_members_invite_status_chk,
    add constraint family_members_invite_status_chk
      check (invite_status in ('pending', 'not_invited', 'invited', 'joined', 'opted_out')) not valid,
    drop constraint if exists family_members_permission_level_chk,
    add constraint family_members_permission_level_chk
      check (permission_level in ('admin', 'contributor', 'viewer')) not valid;

  alter table public.inbound_messages
    drop constraint if exists inbound_messages_raw_body_not_blank_chk,
    add constraint inbound_messages_raw_body_not_blank_chk check (length(trim(raw_body)) > 0) not valid,
    drop constraint if exists inbound_messages_category_chk,
    add constraint inbound_messages_category_chk
      check (category in ('medication', 'appointment', 'task', 'supply', 'general_update', 'concern')) not valid,
    drop constraint if exists inbound_messages_confidence_range_chk,
    add constraint inbound_messages_confidence_range_chk
      check (confidence is null or (confidence >= 0 and confidence <= 1)) not valid,
    drop constraint if exists inbound_messages_source_chk,
    add constraint inbound_messages_source_chk
      check (source in ('sms', 'twilio_sms', 'demo', 'manual', 'import')) not valid;

  alter table public.tasks
    drop constraint if exists tasks_title_not_blank_chk,
    add constraint tasks_title_not_blank_chk check (length(trim(title)) > 0) not valid,
    drop constraint if exists tasks_status_chk,
    add constraint tasks_status_chk check (status in ('open', 'done', 'needs_attention')) not valid;

  alter table public.appointments
    drop constraint if exists appointments_title_not_blank_chk,
    add constraint appointments_title_not_blank_chk check (length(trim(title)) > 0) not valid,
    drop constraint if exists appointments_status_chk,
    add constraint appointments_status_chk
      check (status in ('upcoming', 'completed', 'cancelled', 'needs_attention')) not valid;

  alter table public.supplies
    drop constraint if exists supplies_title_not_blank_chk,
    add constraint supplies_title_not_blank_chk check (length(trim(title)) > 0) not valid,
    drop constraint if exists supplies_status_chk,
    add constraint supplies_status_chk check (status in ('needed', 'purchased', 'delivered')) not valid;

  alter table public.medication_logs
    drop constraint if exists medication_logs_confirmation_not_blank_chk,
    add constraint medication_logs_confirmation_not_blank_chk check (length(trim(confirmation_text)) > 0) not valid;

  alter table public.concerns
    drop constraint if exists concerns_title_not_blank_chk,
    add constraint concerns_title_not_blank_chk check (length(trim(title)) > 0) not valid,
    drop constraint if exists concerns_severity_chk,
    add constraint concerns_severity_chk check (severity in ('family_review', 'flagged', 'urgent')) not valid,
    drop constraint if exists concerns_status_chk,
    add constraint concerns_status_chk check (status in ('open', 'acknowledged', 'closed')) not valid;

  alter table public.daily_summaries
    drop constraint if exists daily_summaries_text_not_blank_chk,
    add constraint daily_summaries_text_not_blank_chk check (length(trim(summary_text)) > 0) not valid,
    drop constraint if exists daily_summaries_source_chk,
    add constraint daily_summaries_source_chk
      check (source in ('deterministic', 'openai', 'weekly_deterministic', 'weekly_openai')) not valid;

  alter table public.billing_subscriptions
    drop constraint if exists billing_subscriptions_plan_id_chk,
    add constraint billing_subscriptions_plan_id_chk
      check (plan_id in ('free', 'starter', 'family', 'family_plus')) not valid,
    drop constraint if exists billing_subscriptions_status_chk,
    add constraint billing_subscriptions_status_chk
      check (status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'cancelled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')) not valid;

  alter table public.subscription_tiers
    drop constraint if exists subscription_tiers_plan_id_chk,
    add constraint subscription_tiers_plan_id_chk
      check (plan_id in ('free', 'starter', 'family', 'family_plus')) not valid,
    drop constraint if exists subscription_tiers_price_nonnegative_chk,
    add constraint subscription_tiers_price_nonnegative_chk
      check (monthly_price_cents >= 0) not valid,
    drop constraint if exists subscription_tiers_limits_positive_chk,
    add constraint subscription_tiers_limits_positive_chk
      check (max_care_circles >= 0 and max_family_members >= 0) not valid;
end;
$$;

insert into public.subscription_tiers (
  plan_id,
  display_name,
  monthly_price_cents,
  max_care_circles,
  max_family_members,
  daily_summaries,
  weekly_summaries,
  export_timeline,
  multiple_care_circles,
  admin_dashboard
)
values
  ('free', 'Free', 0, 1, 3, true, false, false, false, true),
  ('starter', 'Starter', 500, 1, 3, true, false, false, false, true),
  ('family', 'Family', 1000, 1, 8, true, true, false, false, true),
  ('family_plus', 'Family Plus', 2000, 5, 50, true, true, true, true, true)
on conflict (plan_id) do update set
  display_name = excluded.display_name,
  monthly_price_cents = excluded.monthly_price_cents,
  max_care_circles = excluded.max_care_circles,
  max_family_members = excluded.max_family_members,
  daily_summaries = excluded.daily_summaries,
  weekly_summaries = excluded.weekly_summaries,
  export_timeline = excluded.export_timeline,
  multiple_care_circles = excluded.multiple_care_circles,
  admin_dashboard = excluded.admin_dashboard,
  updated_at = now();

create or replace function app_private.current_plan_id_for_user(user_uuid uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select bs.plan_id
      from public.billing_subscriptions bs
      where bs.user_id = user_uuid
        and bs.status in ('trialing', 'active', 'past_due')
      order by bs.updated_at desc nulls last, bs.created_at desc nulls last
      limit 1
    ),
    'free'
  )
$$;

revoke all on function app_private.current_plan_id_for_user(uuid) from public;
grant execute on function app_private.current_plan_id_for_user(uuid) to authenticated, service_role;

create or replace function app_private.can_create_care_circle(user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select count(cc.id) < coalesce(max(st.max_care_circles), 1)
  from public.subscription_tiers st
  left join public.care_circles cc
    on cc.owner_id = user_uuid
  where st.plan_id = app_private.current_plan_id_for_user(user_uuid)
$$;

revoke all on function app_private.can_create_care_circle(uuid) from public;
grant execute on function app_private.can_create_care_circle(uuid) to authenticated, service_role;

do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'profiles_phone_normalized_unique_idx'
  ) and not exists (
    select phone_normalized
    from public.profiles
    where phone_normalized is not null
    group by phone_normalized
    having count(*) > 1
  ) then
    create unique index profiles_phone_normalized_unique_idx
      on public.profiles(phone_normalized)
      where phone_normalized is not null;
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'care_circles_owner_keyword_unique_idx'
  ) and not exists (
    select owner_id, sms_keyword
    from public.care_circles
    where owner_id is not null and sms_keyword is not null
    group by owner_id, sms_keyword
    having count(*) > 1
  ) then
    create unique index care_circles_owner_keyword_unique_idx
      on public.care_circles(owner_id, sms_keyword)
      where owner_id is not null and sms_keyword is not null;
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'family_members_circle_phone_unique_idx'
  ) and not exists (
    select care_circle_id, phone_normalized
    from public.family_members
    where phone_normalized is not null
    group by care_circle_id, phone_normalized
    having count(*) > 1
  ) then
    create unique index family_members_circle_phone_unique_idx
      on public.family_members(care_circle_id, phone_normalized)
      where phone_normalized is not null;
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'daily_summaries_circle_date_unique_idx'
  ) and not exists (
    select care_circle_id, summary_date
    from public.daily_summaries
    group by care_circle_id, summary_date
    having count(*) > 1
  ) then
    create unique index daily_summaries_circle_date_unique_idx
      on public.daily_summaries(care_circle_id, summary_date);
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'billing_subscriptions_stripe_subscription_id_unique_idx'
  ) and not exists (
    select stripe_subscription_id
    from public.billing_subscriptions
    where stripe_subscription_id is not null
    group by stripe_subscription_id
    having count(*) > 1
  ) then
    create unique index billing_subscriptions_stripe_subscription_id_unique_idx
      on public.billing_subscriptions(stripe_subscription_id)
      where stripe_subscription_id is not null;
  end if;
end;
$$;

-- =============================================================================
-- 05. Indexes
-- =============================================================================

create index if not exists profiles_phone_normalized_idx on public.profiles(phone_normalized);
create index if not exists care_circles_owner_id_idx on public.care_circles(owner_id);
create index if not exists care_circles_sms_keyword_idx on public.care_circles(sms_keyword);
create index if not exists care_circles_shared_phone_idx on public.care_circles(shared_phone_number);

create index if not exists care_recipients_circle_idx on public.care_recipients(care_circle_id);

create index if not exists family_members_circle_idx on public.family_members(care_circle_id);
create index if not exists family_members_user_id_idx on public.family_members(user_id);
create index if not exists family_members_phone_normalized_idx on public.family_members(phone_normalized);
create index if not exists family_members_circle_permission_idx on public.family_members(care_circle_id, permission_level);

create index if not exists inbound_messages_circle_created_idx on public.inbound_messages(care_circle_id, created_at desc);
create index if not exists inbound_messages_sender_phone_idx on public.inbound_messages(sender_phone_normalized);
create index if not exists inbound_messages_category_idx on public.inbound_messages(care_circle_id, category);
create index if not exists inbound_messages_concern_idx on public.inbound_messages(care_circle_id, concern_flag);
create index if not exists inbound_messages_payload_gin_idx on public.inbound_messages using gin(parsed_payload);
create index if not exists inbound_messages_keywords_gin_idx on public.inbound_messages using gin(matched_keywords);

create index if not exists tasks_circle_status_idx on public.tasks(care_circle_id, status);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_due_at_idx on public.tasks(care_circle_id, due_at);
create index if not exists tasks_created_at_idx on public.tasks(care_circle_id, created_at desc);

create index if not exists appointments_circle_at_idx on public.appointments(care_circle_id, appointment_at);
create index if not exists appointments_status_idx on public.appointments(care_circle_id, status);

create index if not exists supplies_circle_status_idx on public.supplies(care_circle_id, status);
create index if not exists supplies_requested_by_idx on public.supplies(requested_by);

create index if not exists medication_logs_circle_created_idx on public.medication_logs(care_circle_id, created_at desc);
create index if not exists medication_logs_logged_at_idx on public.medication_logs(care_circle_id, logged_at desc);

create index if not exists concerns_circle_status_idx on public.concerns(care_circle_id, status);
create index if not exists concerns_created_at_idx on public.concerns(care_circle_id, created_at desc);

create index if not exists daily_summaries_circle_date_idx on public.daily_summaries(care_circle_id, summary_date desc);
create index if not exists notifications_circle_created_idx on public.notifications(care_circle_id, created_at desc);
create index if not exists notifications_member_idx on public.notifications(family_member_id);

create index if not exists billing_subscriptions_user_id_idx on public.billing_subscriptions(user_id);
create index if not exists billing_subscriptions_care_circle_id_idx on public.billing_subscriptions(care_circle_id);
create index if not exists billing_subscriptions_stripe_customer_id_idx on public.billing_subscriptions(stripe_customer_id);
create index if not exists billing_subscriptions_stripe_subscription_id_idx on public.billing_subscriptions(stripe_subscription_id);
create index if not exists billing_subscriptions_status_idx on public.billing_subscriptions(status);
create index if not exists subscription_tiers_admin_dashboard_idx on public.subscription_tiers(admin_dashboard);

-- =============================================================================
-- 05b. Access Views
-- =============================================================================

create or replace view public.admin_dashboard_access
with (security_invoker = true)
as
select
  cc.owner_id as user_id,
  cc.id as care_circle_id,
  'owner'::text as access_rank,
  app_private.current_plan_id_for_user(cc.owner_id) as plan_id,
  bs.status as billing_status,
  st.max_care_circles,
  st.max_family_members,
  st.admin_dashboard
from public.care_circles cc
join public.subscription_tiers st
  on st.plan_id = app_private.current_plan_id_for_user(cc.owner_id)
left join lateral (
  select status
  from public.billing_subscriptions bs
  where bs.user_id = cc.owner_id
    and bs.status in ('trialing', 'active', 'past_due')
  order by bs.updated_at desc nulls last, bs.created_at desc nulls last
  limit 1
) bs on true
where cc.owner_id = auth.uid()
  and st.admin_dashboard = true
union all
select
  fm.user_id,
  fm.care_circle_id,
  case
    when fm.role = 'owner' then 'owner'
    else 'admin'
  end as access_rank,
  app_private.current_plan_id_for_user(cc.owner_id) as plan_id,
  bs.status as billing_status,
  st.max_care_circles,
  st.max_family_members,
  st.admin_dashboard
from public.family_members fm
join public.care_circles cc
  on cc.id = fm.care_circle_id
join public.subscription_tiers st
  on st.plan_id = app_private.current_plan_id_for_user(cc.owner_id)
left join lateral (
  select status
  from public.billing_subscriptions bs
  where bs.user_id = cc.owner_id
    and bs.status in ('trialing', 'active', 'past_due')
  order by bs.updated_at desc nulls last, bs.created_at desc nulls last
  limit 1
) bs on true
where fm.user_id = auth.uid()
  and st.admin_dashboard = true
  and (
    fm.permission_level = 'admin'
    or fm.role in ('owner', 'admin')
  );

-- =============================================================================
-- 06. Updated-at Triggers
-- =============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles',
    'care_circles',
    'care_recipients',
    'family_members',
    'tasks',
    'appointments',
    'supplies',
    'concerns',
    'daily_summaries',
    'billing_subscriptions',
    'subscription_tiers',
    'subscriptions'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', t, t);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t,
      t
    );
  end loop;
end;
$$;

-- =============================================================================
-- 07. Grants for Supabase Data API
-- =============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on
  public.profiles,
  public.care_circles,
  public.care_recipients,
  public.family_members,
  public.inbound_messages,
  public.tasks,
  public.appointments,
  public.supplies,
  public.medication_logs,
  public.concerns,
  public.daily_summaries,
  public.notifications
to authenticated;

grant select on public.billing_subscriptions to authenticated;
grant select on public.subscription_tiers to authenticated;
grant select on public.admin_dashboard_access to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

-- =============================================================================
-- 08. Row Level Security Policies
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.care_circles enable row level security;
alter table public.care_recipients enable row level security;
alter table public.family_members enable row level security;
alter table public.inbound_messages enable row level security;
alter table public.tasks enable row level security;
alter table public.appointments enable row level security;
alter table public.supplies enable row level security;
alter table public.medication_logs enable row level security;
alter table public.concerns enable row level security;
alter table public.daily_summaries enable row level security;
alter table public.notifications enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.subscription_tiers enable row level security;
alter table public.subscriptions enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles',
        'care_circles',
        'care_recipients',
        'family_members',
        'inbound_messages',
        'tasks',
        'appointments',
        'supplies',
        'medication_logs',
        'concerns',
        'daily_summaries',
        'notifications',
        'billing_subscriptions',
        'subscription_tiers',
        'subscriptions'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end;
$$;

create policy profiles_select_own
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy profiles_insert_own
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy profiles_update_own
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy care_circles_select_member
  on public.care_circles for select to authenticated
  using (id in (select care_circle_id from app_private.care_circle_ids_for_user(auth.uid())));

create policy care_circles_insert_owner
  on public.care_circles for insert to authenticated
  with check (owner_id = auth.uid() and app_private.can_create_care_circle(auth.uid()));

create policy care_circles_update_owner
  on public.care_circles for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy care_circles_delete_owner
  on public.care_circles for delete to authenticated
  using (owner_id = auth.uid());

create policy care_recipients_select_member
  on public.care_recipients for select to authenticated
  using (app_private.is_care_circle_member(care_circle_id));

create policy care_recipients_insert_owner
  on public.care_recipients for insert to authenticated
  with check (app_private.is_care_circle_admin(care_circle_id));

create policy care_recipients_update_owner
  on public.care_recipients for update to authenticated
  using (app_private.is_care_circle_admin(care_circle_id))
  with check (app_private.is_care_circle_admin(care_circle_id));

create policy care_recipients_delete_owner
  on public.care_recipients for delete to authenticated
  using (app_private.is_care_circle_owner(care_circle_id));

create policy family_members_select_member
  on public.family_members for select to authenticated
  using (app_private.is_care_circle_member(care_circle_id));

create policy family_members_insert_owner
  on public.family_members for insert to authenticated
  with check (app_private.is_care_circle_admin(care_circle_id));

create policy family_members_update_owner_or_self
  on public.family_members for update to authenticated
  using (app_private.is_care_circle_admin(care_circle_id) or user_id = auth.uid())
  with check (app_private.is_care_circle_admin(care_circle_id) or user_id = auth.uid());

create policy family_members_delete_owner
  on public.family_members for delete to authenticated
  using (app_private.is_care_circle_owner(care_circle_id));

create policy inbound_messages_select_member
  on public.inbound_messages for select to authenticated
  using (app_private.is_care_circle_member(care_circle_id));

create policy inbound_messages_insert_member
  on public.inbound_messages for insert to authenticated
  with check (app_private.is_care_circle_member(care_circle_id));

create policy inbound_messages_update_owner
  on public.inbound_messages for update to authenticated
  using (app_private.is_care_circle_owner(care_circle_id))
  with check (app_private.is_care_circle_owner(care_circle_id));

create policy inbound_messages_delete_owner
  on public.inbound_messages for delete to authenticated
  using (app_private.is_care_circle_owner(care_circle_id));

create policy tasks_select_member
  on public.tasks for select to authenticated
  using (app_private.is_care_circle_member(care_circle_id));

create policy tasks_insert_member
  on public.tasks for insert to authenticated
  with check (app_private.is_care_circle_member(care_circle_id));

create policy tasks_update_member
  on public.tasks for update to authenticated
  using (app_private.is_care_circle_member(care_circle_id))
  with check (app_private.is_care_circle_member(care_circle_id));

create policy tasks_delete_owner
  on public.tasks for delete to authenticated
  using (app_private.is_care_circle_owner(care_circle_id));

create policy appointments_select_member
  on public.appointments for select to authenticated
  using (app_private.is_care_circle_member(care_circle_id));

create policy appointments_insert_member
  on public.appointments for insert to authenticated
  with check (app_private.is_care_circle_member(care_circle_id));

create policy appointments_update_member
  on public.appointments for update to authenticated
  using (app_private.is_care_circle_member(care_circle_id))
  with check (app_private.is_care_circle_member(care_circle_id));

create policy appointments_delete_owner
  on public.appointments for delete to authenticated
  using (app_private.is_care_circle_owner(care_circle_id));

create policy supplies_select_member
  on public.supplies for select to authenticated
  using (app_private.is_care_circle_member(care_circle_id));

create policy supplies_insert_member
  on public.supplies for insert to authenticated
  with check (app_private.is_care_circle_member(care_circle_id));

create policy supplies_update_member
  on public.supplies for update to authenticated
  using (app_private.is_care_circle_member(care_circle_id))
  with check (app_private.is_care_circle_member(care_circle_id));

create policy supplies_delete_owner
  on public.supplies for delete to authenticated
  using (app_private.is_care_circle_owner(care_circle_id));

create policy medication_logs_select_member
  on public.medication_logs for select to authenticated
  using (app_private.is_care_circle_member(care_circle_id));

create policy medication_logs_insert_member
  on public.medication_logs for insert to authenticated
  with check (app_private.is_care_circle_member(care_circle_id));

create policy medication_logs_update_owner
  on public.medication_logs for update to authenticated
  using (app_private.is_care_circle_owner(care_circle_id))
  with check (app_private.is_care_circle_owner(care_circle_id));

create policy medication_logs_delete_owner
  on public.medication_logs for delete to authenticated
  using (app_private.is_care_circle_owner(care_circle_id));

create policy concerns_select_member
  on public.concerns for select to authenticated
  using (app_private.is_care_circle_member(care_circle_id));

create policy concerns_insert_member
  on public.concerns for insert to authenticated
  with check (app_private.is_care_circle_member(care_circle_id));

create policy concerns_update_member
  on public.concerns for update to authenticated
  using (app_private.is_care_circle_member(care_circle_id))
  with check (app_private.is_care_circle_member(care_circle_id));

create policy concerns_delete_owner
  on public.concerns for delete to authenticated
  using (app_private.is_care_circle_owner(care_circle_id));

create policy daily_summaries_select_member
  on public.daily_summaries for select to authenticated
  using (app_private.is_care_circle_member(care_circle_id));

create policy daily_summaries_insert_member
  on public.daily_summaries for insert to authenticated
  with check (app_private.is_care_circle_member(care_circle_id));

create policy daily_summaries_update_member
  on public.daily_summaries for update to authenticated
  using (app_private.is_care_circle_member(care_circle_id))
  with check (app_private.is_care_circle_member(care_circle_id));

create policy daily_summaries_delete_owner
  on public.daily_summaries for delete to authenticated
  using (app_private.is_care_circle_owner(care_circle_id));

create policy notifications_select_member
  on public.notifications for select to authenticated
  using (app_private.is_care_circle_member(care_circle_id));

create policy notifications_insert_owner
  on public.notifications for insert to authenticated
  with check (app_private.is_care_circle_owner(care_circle_id));

create policy notifications_update_recipient_or_owner
  on public.notifications for update to authenticated
  using (
    app_private.is_care_circle_owner(care_circle_id)
    or family_member_id in (
      select id from public.family_members where user_id = auth.uid()
    )
  )
  with check (app_private.is_care_circle_member(care_circle_id));

create policy notifications_delete_owner
  on public.notifications for delete to authenticated
  using (app_private.is_care_circle_owner(care_circle_id));

create policy billing_subscriptions_select_own
  on public.billing_subscriptions for select to authenticated
  using (auth.uid() = user_id);

create policy subscription_tiers_select_all_authenticated
  on public.subscription_tiers for select to authenticated
  using (true);

create policy legacy_subscriptions_select_owner
  on public.subscriptions for select to authenticated
  using (auth.uid() = owner_id);

-- =============================================================================
-- 09. Atomic SMS Ingestion RPC
-- =============================================================================

create or replace function public.create_inbound_message_with_linked_record(payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  inbound_id uuid;
  linked_id uuid;
  category_value text;
begin
  category_value := coalesce(payload->>'category', 'general_update');

  if category_value not in ('medication', 'appointment', 'task', 'supply', 'general_update', 'concern') then
    category_value := 'general_update';
  end if;

  insert into public.inbound_messages (
    care_circle_id,
    family_member_id,
    sender_name,
    sender_phone,
    sender_phone_normalized,
    raw_body,
    cleaned_body,
    sms_keyword_used,
    category,
    confidence,
    concern_flag,
    matched_keywords,
    parsed_payload,
    source
  )
  values (
    (payload->>'care_circle_id')::uuid,
    nullif(payload->>'family_member_id', '')::uuid,
    payload->>'sender_name',
    payload->>'sender_phone',
    payload->>'sender_phone_normalized',
    coalesce(payload->>'raw_body', payload->>'cleaned_body', ''),
    payload->>'cleaned_body',
    payload->>'sms_keyword_used',
    category_value,
    nullif(payload->>'confidence', '')::numeric,
    coalesce(nullif(payload->>'concern_flag', '')::boolean, false),
    array(select jsonb_array_elements_text(coalesce(payload->'matched_keywords', '[]'::jsonb))),
    coalesce(payload->'parsed_payload', '{}'::jsonb),
    coalesce(payload->>'source', 'sms')
  )
  returning id into inbound_id;

  if category_value = 'medication' then
    insert into public.medication_logs (care_circle_id, inbound_message_id, confirmation_text, given_by)
    values (
      (payload->>'care_circle_id')::uuid,
      inbound_id,
      coalesce(payload->'parsed_payload'->>'confirmationText', payload->>'cleaned_body', payload->>'raw_body'),
      payload->>'family_member_id'
    )
    returning id into linked_id;
  elsif category_value = 'appointment' then
    insert into public.appointments (care_circle_id, inbound_message_id, title)
    values (
      (payload->>'care_circle_id')::uuid,
      inbound_id,
      coalesce(payload->'parsed_payload'->>'title', payload->>'cleaned_body', 'Appointment')
    )
    returning id into linked_id;
  elsif category_value = 'task' then
    insert into public.tasks (care_circle_id, inbound_message_id, title, status)
    values (
      (payload->>'care_circle_id')::uuid,
      inbound_id,
      coalesce(payload->'parsed_payload'->>'title', payload->>'cleaned_body', 'Task'),
      'open'
    )
    returning id into linked_id;
  elsif category_value = 'supply' then
    insert into public.supplies (care_circle_id, inbound_message_id, title, status)
    values (
      (payload->>'care_circle_id')::uuid,
      inbound_id,
      coalesce(payload->'parsed_payload'->>'item', payload->>'cleaned_body', 'Supply needed'),
      'needed'
    )
    returning id into linked_id;
  elsif category_value = 'concern' then
    insert into public.concerns (care_circle_id, inbound_message_id, title, details, severity, status)
    values (
      (payload->>'care_circle_id')::uuid,
      inbound_id,
      'Concern Flagged',
      coalesce(payload->'parsed_payload'->>'concernText', payload->>'cleaned_body', payload->>'raw_body'),
      coalesce(payload->'parsed_payload'->>'severity', 'family_review'),
      'open'
    )
    returning id into linked_id;
  end if;

  return jsonb_build_object(
    'inboundMessageId', inbound_id,
    'linkedRecordId', linked_id,
    'category', category_value
  );
end;
$$;

revoke all on function public.create_inbound_message_with_linked_record(jsonb) from public;
grant execute on function public.create_inbound_message_with_linked_record(jsonb) to service_role;

-- =============================================================================
-- 10. Cleanup Helper Grants
-- =============================================================================

revoke all on function public.ensure_column(regclass, text, text) from public;

commit;
