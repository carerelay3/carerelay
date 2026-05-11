ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS platform_role text DEFAULT 'user';

UPDATE public.profiles
SET platform_role = COALESCE(platform_role, 'user');

ALTER TABLE public.profiles
  ALTER COLUMN platform_role SET DEFAULT 'user';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_platform_role_chk,
  ADD CONSTRAINT profiles_platform_role_chk
    CHECK (platform_role IN ('user', 'admin', 'founder')) NOT VALID;

CREATE INDEX IF NOT EXISTS profiles_platform_role_idx
  ON public.profiles(platform_role);
