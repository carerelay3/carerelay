CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
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

ALTER TABLE public.family_members
  ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id) on delete set null;

ALTER TABLE public.family_members
  ADD COLUMN IF NOT EXISTS permission_level text default 'contributor';

ALTER TABLE public.family_members
  ADD COLUMN IF NOT EXISTS role text default 'member';

ALTER TABLE public.daily_summaries
  ADD COLUMN IF NOT EXISTS source text default 'deterministic';

ALTER TABLE public.daily_summaries
  ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

CREATE INDEX IF NOT EXISTS billing_subscriptions_user_id_idx
  ON public.billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS billing_subscriptions_care_circle_id_idx
  ON public.billing_subscriptions(care_circle_id);
CREATE INDEX IF NOT EXISTS billing_subscriptions_stripe_customer_id_idx
  ON public.billing_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS billing_subscriptions_stripe_subscription_id_idx
  ON public.billing_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS billing_subscriptions_status_idx
  ON public.billing_subscriptions(status);

ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own billing subscriptions"
  ON public.billing_subscriptions;

CREATE POLICY "Users can view their own billing subscriptions"
  ON public.billing_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.subscription_tiers (
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

INSERT INTO public.subscription_tiers (
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
VALUES
  ('free', 'Free', 0, 1, 3, true, false, false, false, true),
  ('starter', 'Starter', 500, 1, 3, true, false, false, false, true),
  ('family', 'Family', 1000, 1, 8, true, true, false, false, true),
  ('family_plus', 'Family Plus', 2000, 5, 50, true, true, true, true, true)
ON CONFLICT (plan_id) DO UPDATE SET
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

CREATE INDEX IF NOT EXISTS subscription_tiers_admin_dashboard_idx
  ON public.subscription_tiers(admin_dashboard);

ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Subscription tiers visible to authenticated users"
  ON public.subscription_tiers;

CREATE POLICY "Subscription tiers visible to authenticated users"
  ON public.subscription_tiers FOR SELECT
  TO authenticated
  USING (true);

CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.current_plan_id_for_user(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT bs.plan_id
      FROM public.billing_subscriptions bs
      WHERE bs.user_id = user_uuid
        AND bs.status IN ('trialing', 'active', 'past_due')
      ORDER BY bs.updated_at DESC NULLS LAST, bs.created_at DESC NULLS LAST
      LIMIT 1
    ),
    'free'
  )
$$;

REVOKE ALL ON FUNCTION app_private.current_plan_id_for_user(uuid) FROM public;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.current_plan_id_for_user(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.can_create_care_circle(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(cc.id) < COALESCE(max(st.max_care_circles), 1)
  FROM public.subscription_tiers st
  LEFT JOIN public.care_circles cc
    ON cc.owner_id = user_uuid
  WHERE st.plan_id = app_private.current_plan_id_for_user(user_uuid)
$$;

REVOKE ALL ON FUNCTION app_private.can_create_care_circle(uuid) FROM public;
GRANT EXECUTE ON FUNCTION app_private.can_create_care_circle(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.is_care_circle_admin(circle_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.care_circles cc
    WHERE cc.id = circle_uuid
      AND cc.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.family_members fm
    WHERE fm.care_circle_id = circle_uuid
      AND fm.user_id = auth.uid()
      AND (
        fm.permission_level = 'admin'
        OR fm.role IN ('owner', 'admin')
      )
  )
$$;

REVOKE ALL ON FUNCTION app_private.is_care_circle_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION app_private.is_care_circle_admin(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Insert care circles" ON public.care_circles;
DROP POLICY IF EXISTS care_circles_insert_owner ON public.care_circles;
CREATE POLICY care_circles_insert_owner
  ON public.care_circles FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid() AND app_private.can_create_care_circle(auth.uid()));

DROP POLICY IF EXISTS "Family members insertable by circle owner" ON public.family_members;
DROP POLICY IF EXISTS family_members_insert_owner ON public.family_members;
CREATE POLICY family_members_insert_admin
  ON public.family_members FOR INSERT
  TO authenticated
  WITH CHECK (app_private.is_care_circle_admin(care_circle_id));

DROP POLICY IF EXISTS "Family members updateable by circle owner" ON public.family_members;
DROP POLICY IF EXISTS family_members_update_owner_or_self ON public.family_members;
CREATE POLICY family_members_update_admin_or_self
  ON public.family_members FOR UPDATE
  TO authenticated
  USING (app_private.is_care_circle_admin(care_circle_id) OR user_id = auth.uid())
  WITH CHECK (app_private.is_care_circle_admin(care_circle_id) OR user_id = auth.uid());

CREATE OR REPLACE VIEW public.admin_dashboard_access
WITH (security_invoker = true)
AS
SELECT
  cc.owner_id AS user_id,
  cc.id AS care_circle_id,
  'owner'::text AS access_rank,
  app_private.current_plan_id_for_user(cc.owner_id) AS plan_id,
  bs.status AS billing_status,
  st.max_care_circles,
  st.max_family_members,
  st.admin_dashboard
FROM public.care_circles cc
JOIN public.subscription_tiers st
  ON st.plan_id = app_private.current_plan_id_for_user(cc.owner_id)
LEFT JOIN LATERAL (
  SELECT status
  FROM public.billing_subscriptions bs
  WHERE bs.user_id = cc.owner_id
    AND bs.status IN ('trialing', 'active', 'past_due')
  ORDER BY bs.updated_at DESC NULLS LAST, bs.created_at DESC NULLS LAST
  LIMIT 1
) bs ON true
WHERE cc.owner_id = auth.uid()
  AND st.admin_dashboard = true
UNION ALL
SELECT
  fm.user_id,
  fm.care_circle_id,
  CASE WHEN fm.role = 'owner' THEN 'owner' ELSE 'admin' END AS access_rank,
  app_private.current_plan_id_for_user(cc.owner_id) AS plan_id,
  bs.status AS billing_status,
  st.max_care_circles,
  st.max_family_members,
  st.admin_dashboard
FROM public.family_members fm
JOIN public.care_circles cc
  ON cc.id = fm.care_circle_id
JOIN public.subscription_tiers st
  ON st.plan_id = app_private.current_plan_id_for_user(cc.owner_id)
LEFT JOIN LATERAL (
  SELECT status
  FROM public.billing_subscriptions bs
  WHERE bs.user_id = cc.owner_id
    AND bs.status IN ('trialing', 'active', 'past_due')
  ORDER BY bs.updated_at DESC NULLS LAST, bs.created_at DESC NULLS LAST
  LIMIT 1
) bs ON true
WHERE fm.user_id = auth.uid()
  AND st.admin_dashboard = true
  AND (
    fm.permission_level = 'admin'
    OR fm.role IN ('owner', 'admin')
  );

GRANT SELECT ON public.subscription_tiers TO authenticated;
GRANT SELECT ON public.admin_dashboard_access TO authenticated;
