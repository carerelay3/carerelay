create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  phone_normalized text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists care_circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  name text not null,
  sms_keyword text,
  shared_phone_number text,
  demo_mode boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists care_recipients (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  first_name text not null,
  relationship text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  user_id uuid references profiles(id),
  name text not null,
  phone text,
  phone_normalized text,
  role text,
  invite_status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists inbound_messages (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  family_member_id uuid references family_members(id),
  sender_name text,
  sender_phone text,
  sender_phone_normalized text,
  raw_body text not null,
  cleaned_body text,
  sms_keyword_used text,
  category text,
  confidence numeric,
  concern_flag boolean default false,
  matched_keywords jsonb,
  parsed_payload jsonb,
  source text,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  inbound_message_id uuid references inbound_messages(id),
  title text not null,
  details text,
  status text default 'open',
  assigned_to uuid references family_members(id),
  due_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  inbound_message_id uuid references inbound_messages(id),
  title text not null,
  details text,
  appointment_at timestamptz,
  status text default 'upcoming',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists supplies (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  inbound_message_id uuid references inbound_messages(id),
  title text not null,
  details text,
  status text default 'needed',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists medication_logs (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  inbound_message_id uuid references inbound_messages(id),
  medication_name text,
  confirmation_text text not null,
  given_by uuid references family_members(id),
  logged_at timestamptz default now(),
  notes text,
  created_at timestamptz default now()
);

create table if not exists concerns (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  inbound_message_id uuid references inbound_messages(id),
  title text not null,
  details text,
  severity text default 'flagged',
  status text default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists daily_summaries (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  summary_date date,
  summary_text text,
  source text default 'fallback',
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  family_member_id uuid references family_members(id),
  type text,
  title text,
  body text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_inbound_care_circle on inbound_messages(care_circle_id);
create index if not exists idx_tasks_care_circle on tasks(care_circle_id);
create index if not exists idx_appt_care_circle on appointments(care_circle_id);
create index if not exists idx_supplies_care_circle on supplies(care_circle_id);
create index if not exists idx_meds_care_circle on medication_logs(care_circle_id);
create index if not exists idx_concerns_care_circle on concerns(care_circle_id);
create index if not exists idx_daily_care_circle on daily_summaries(care_circle_id);
create index if not exists idx_notifications_care_circle on notifications(care_circle_id);

create index if not exists idx_inbound_created_at on inbound_messages(created_at);
create index if not exists idx_appointment_at on appointments(appointment_at);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_supplies_status on supplies(status);
create index if not exists idx_concerns_status on concerns(status);

create index if not exists idx_inbound_concern_flag on inbound_messages(concern_flag);

create index if not exists idx_family_members_phone_normalized on family_members(phone_normalized);
create index if not exists idx_care_circles_sms_keyword on care_circles(sms_keyword);

alter table care_circles enable row level security;
alter table family_members enable row level security;
alter table inbound_messages enable row level security;
alter table tasks enable row level security;
alter table appointments enable row level security;
alter table supplies enable row level security;
alter table medication_logs enable row level security;
alter table concerns enable row level security;
alter table daily_summaries enable row level security;
alter table profiles enable row level security;
alter table care_recipients enable row level security;
alter table notifications enable row level security;

-- Basic RLS for MVP
create policy "users can read their own profile" on profiles for select using (auth.uid() = id);

create policy "owner can manage care circles" on care_circles for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "members can view care circles" on care_circles for select using (
  id in (select care_circle_id from family_members where user_id = auth.uid())
);

create policy "members can manage care recipients" on care_recipients for all using (
  care_circle_id in (select care_circle_id from family_members where user_id = auth.uid())
);

create policy "members can view family members" on family_members for select using (
  care_circle_id in (select care_circle_id from family_members where user_id = auth.uid())
);

create policy "members can view inbound messages" on inbound_messages for select using (
  care_circle_id in (select care_circle_id from family_members where user_id = auth.uid())
);

create policy "members can manage tasks" on tasks for all using (
  care_circle_id in (select care_circle_id from family_members where user_id = auth.uid())
);

create policy "members can manage appointments" on appointments for all using (
  care_circle_id in (select care_circle_id from family_members where user_id = auth.uid())
);

create policy "members can manage supplies" on supplies for all using (
  care_circle_id in (select care_circle_id from family_members where user_id = auth.uid())
);

create policy "members can manage meds" on medication_logs for all using (
  care_circle_id in (select care_circle_id from family_members where user_id = auth.uid())
);

create policy "members can manage concerns" on concerns for all using (
  care_circle_id in (select care_circle_id from family_members where user_id = auth.uid())
);

create policy "members can view summaries" on daily_summaries for select using (
  care_circle_id in (select care_circle_id from family_members where user_id = auth.uid())
);

create policy "members can view notifications" on notifications for select using (
  care_circle_id in (select care_circle_id from family_members where user_id = auth.uid())
);
