create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists care_circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  name text not null,
  shared_phone_number text,
  summary_time text,
  timezone text,
  mode text default 'demo',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists care_recipients (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  first_name text not null,
  last_name text,
  age int,
  relationship text,
  general_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  name text not null,
  role text,
  phone_number text,
  email text,
  permission_level text default 'contributor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists inbound_messages (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  family_member_id uuid references family_members(id),
  from_phone text,
  to_phone text,
  body text not null,
  category text,
  confidence numeric,
  concern_flag boolean default false,
  processed boolean default false,
  created_record_type text,
  created_record_id uuid,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references family_members(id),
  due_at timestamptz,
  status text default 'open',
  source_message_id uuid references inbound_messages(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  title text not null,
  appointment_at timestamptz,
  location text,
  notes text,
  transportation_confirmed boolean default false,
  assigned_driver uuid references family_members(id),
  source_message_id uuid references inbound_messages(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists supplies (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  item text not null,
  quantity text,
  requested_by uuid references family_members(id),
  status text default 'needed',
  source_message_id uuid references inbound_messages(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists medication_logs (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  medication_name text,
  confirmation_text text not null,
  confirmed_by uuid references family_members(id),
  confirmed_at timestamptz,
  source_message_id uuid references inbound_messages(id),
  created_at timestamptz default now()
);

create table if not exists concerns (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  source_message_id uuid references inbound_messages(id),
  concern_text text not null,
  severity text default 'flagged',
  acknowledged boolean default false,
  acknowledged_by uuid references family_members(id),
  acknowledged_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists daily_summaries (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  summary_date date,
  completed jsonb,
  upcoming jsonb,
  open_tasks jsonb,
  supplies_needed jsonb,
  medication_confirmations jsonb,
  concerns_mentioned jsonb,
  general_notes jsonb,
  summary_text text,
  generated_by text default 'fallback',
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references care_circles(id) on delete cascade,
  family_member_id uuid references family_members(id),
  type text,
  content text,
  sent_at timestamptz,
  status text,
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
create index if not exists idx_inbound_concern_flag on inbound_messages(concern_flag);

alter table care_circles enable row level security;
alter table family_members enable row level security;
alter table inbound_messages enable row level security;
alter table tasks enable row level security;
alter table appointments enable row level security;
alter table supplies enable row level security;
alter table medication_logs enable row level security;
alter table concerns enable row level security;
alter table daily_summaries enable row level security;

create policy "owner can read care circles" on care_circles for select using (owner_id = auth.uid());
create policy "owner can manage care circles" on care_circles for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
