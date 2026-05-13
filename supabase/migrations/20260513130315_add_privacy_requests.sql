create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  request_type text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  handled_by uuid references auth.users(id) on delete set null,
  handled_at timestamptz
);

alter table public.privacy_requests
  add constraint privacy_requests_request_type_check
  check (request_type in ('export_my_data', 'delete_my_account', 'delete_care_circle_data', 'billing_help', 'other'));

alter table public.privacy_requests
  add constraint privacy_requests_status_check
  check (status in ('open', 'in_review', 'completed', 'rejected'));

create index if not exists privacy_requests_user_id_idx
  on public.privacy_requests(user_id, created_at desc);

create index if not exists privacy_requests_status_idx
  on public.privacy_requests(status, created_at desc);

alter table public.privacy_requests enable row level security;

create policy "Users can create their own privacy requests"
  on public.privacy_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can read their own privacy requests"
  on public.privacy_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

comment on table public.privacy_requests is 'Tracks privacy, data export, deletion, billing, and related account requests. Requests are reviewed manually; this table does not perform deletion.';
