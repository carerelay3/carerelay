ALTER TABLE public.family_members
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS removed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE public.family_members
SET
  status = COALESCE(
    status,
    CASE
      WHEN invite_status = 'invited' THEN 'invited'
      WHEN invite_status = 'opted_out' THEN 'removed'
      ELSE 'active'
    END
  ),
  role = COALESCE(role, 'member'),
  updated_at = COALESCE(updated_at, now());

ALTER TABLE public.family_members
  ALTER COLUMN role SET DEFAULT 'member',
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.family_members
  DROP CONSTRAINT IF EXISTS family_members_status_chk,
  ADD CONSTRAINT family_members_status_chk
    CHECK (status IN ('active', 'invited', 'removed')) NOT VALID;

CREATE INDEX IF NOT EXISTS family_members_circle_idx
  ON public.family_members(care_circle_id);
CREATE INDEX IF NOT EXISTS family_members_user_id_idx
  ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS family_members_phone_normalized_idx
  ON public.family_members(phone_normalized);
CREATE INDEX IF NOT EXISTS family_members_role_idx
  ON public.family_members(role);
CREATE INDEX IF NOT EXISTS family_members_status_idx
  ON public.family_members(status);
CREATE INDEX IF NOT EXISTS family_members_circle_status_idx
  ON public.family_members(care_circle_id, status);

DROP INDEX IF EXISTS public.family_members_circle_phone_unique_idx;
DROP INDEX IF EXISTS public.idx_family_members_circle_phone_unique;
CREATE UNIQUE INDEX IF NOT EXISTS family_members_circle_phone_unique_idx
  ON public.family_members(care_circle_id, phone_normalized)
  WHERE phone_normalized IS NOT NULL
    AND COALESCE(status, 'active') <> 'removed';

CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.care_circle_ids_for_user(user_uuid uuid)
RETURNS TABLE(care_circle_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cc.id
  FROM public.care_circles cc
  WHERE cc.owner_id = user_uuid
  UNION
  SELECT fm.care_circle_id
  FROM public.family_members fm
  WHERE fm.user_id = user_uuid
    AND fm.care_circle_id IS NOT NULL
    AND COALESCE(fm.status, 'active') <> 'removed'
$$;

REVOKE ALL ON FUNCTION app_private.care_circle_ids_for_user(uuid) FROM public;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.care_circle_ids_for_user(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.is_care_circle_member(circle_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM app_private.care_circle_ids_for_user(auth.uid()) allowed
    WHERE allowed.care_circle_id = circle_uuid
  )
$$;

REVOKE ALL ON FUNCTION app_private.is_care_circle_member(uuid) FROM public;
GRANT EXECUTE ON FUNCTION app_private.is_care_circle_member(uuid) TO authenticated, service_role;

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
      AND COALESCE(fm.status, 'active') <> 'removed'
      AND (
        fm.permission_level = 'admin'
        OR fm.role IN ('owner', 'admin')
      )
  )
$$;

REVOKE ALL ON FUNCTION app_private.is_care_circle_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION app_private.is_care_circle_admin(uuid) TO authenticated, service_role;

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS family_members_select_member ON public.family_members;
DROP POLICY IF EXISTS family_members_insert_owner ON public.family_members;
DROP POLICY IF EXISTS family_members_insert_admin ON public.family_members;
DROP POLICY IF EXISTS family_members_update_owner_or_self ON public.family_members;
DROP POLICY IF EXISTS family_members_update_admin_or_self ON public.family_members;
DROP POLICY IF EXISTS family_members_delete_owner ON public.family_members;
DROP POLICY IF EXISTS "Family members insertable by circle owner" ON public.family_members;
DROP POLICY IF EXISTS "Family members updateable by circle owner" ON public.family_members;
CREATE POLICY family_members_select_member
  ON public.family_members FOR SELECT
  TO authenticated
  USING (app_private.is_care_circle_member(care_circle_id));
