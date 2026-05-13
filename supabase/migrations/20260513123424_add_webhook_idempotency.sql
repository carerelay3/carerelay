create table if not exists public.processed_twilio_messages (
  message_sid text primary key,
  created_at timestamptz not null default now(),
  care_circle_id uuid references public.care_circles(id) on delete set null,
  status text
);

create index if not exists processed_twilio_messages_created_at_idx
  on public.processed_twilio_messages(created_at desc);

alter table public.processed_twilio_messages enable row level security;

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text,
  processed_at timestamptz not null default now(),
  status text,
  error_message text
);

create index if not exists stripe_webhook_events_processed_at_idx
  on public.stripe_webhook_events(processed_at desc);

alter table public.stripe_webhook_events enable row level security;

comment on table public.processed_twilio_messages is 'Idempotency guard for Twilio inbound SMS MessageSid values.';
comment on table public.stripe_webhook_events is 'Idempotency guard and processing ledger for Stripe webhook event ids.';
