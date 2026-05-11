ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS phone_normalized text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

UPDATE public.profiles
SET updated_at = now()
WHERE updated_at IS NULL;

CREATE INDEX IF NOT EXISTS profiles_phone_normalized_idx
  ON public.profiles(phone_normalized);
