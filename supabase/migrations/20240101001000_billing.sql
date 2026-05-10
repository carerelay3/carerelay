CREATE TABLE IF NOT EXISTS public.subscriptions (
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

CREATE INDEX IF NOT EXISTS subscriptions_care_circle_id_idx ON public.subscriptions(care_circle_id);
CREATE INDEX IF NOT EXISTS subscriptions_owner_id_idx ON public.subscriptions(owner_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subscriptions for care circles they belong to"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.uid() = owner_id);