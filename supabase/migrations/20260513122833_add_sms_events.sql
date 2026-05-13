create table if not exists public.sms_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  message_sid text,
  from_phone text,
  to_phone text,
  body_preview text,
  signature_valid boolean,
  routing_status text,
  care_circle_id uuid references public.care_circles(id) on delete set null,
  family_member_id uuid references public.family_members(id) on delete set null,
  parse_category text,
  concern_flag boolean not null default false,
  persistence_status text,
  error_code text,
  error_message text,
  request_id text,
  environment text
);

create index if not exists sms_events_created_at_idx
  on public.sms_events(created_at desc);

create index if not exists sms_events_message_sid_idx
  on public.sms_events(message_sid)
  where message_sid is not null;

create index if not exists sms_events_routing_status_idx
  on public.sms_events(routing_status);

create index if not exists sms_events_error_code_idx
  on public.sms_events(error_code)
  where error_code is not null;

alter table public.sms_events enable row level security;

comment on table public.sms_events is 'Durable operational log for inbound SMS processing outcomes.';
comment on column public.sms_events.body_preview is 'Truncated inbound SMS body preview for operations debugging; full body is stored only in inbound_messages when routing and persistence succeed.';
