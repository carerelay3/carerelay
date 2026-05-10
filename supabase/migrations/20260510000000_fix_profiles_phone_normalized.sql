-- Ensure profiles table has phone_normalized column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_normalized TEXT;