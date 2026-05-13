-- Migration: Add multi-mode circle types foundation to CircleRelay

ALTER TABLE public.care_circles 
ADD COLUMN IF NOT EXISTS circle_type text NOT NULL DEFAULT 'care',
ADD COLUMN IF NOT EXISTS category_config jsonb,
ADD COLUMN IF NOT EXISTS enabled_features jsonb;

UPDATE public.care_circles
SET circle_type = 'care'
WHERE circle_type IS NULL;

ALTER TABLE public.care_circles
ALTER COLUMN circle_type SET DEFAULT 'care';

ALTER TABLE public.care_circles
ALTER COLUMN circle_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'care_circles_circle_type_check'
      AND conrelid = 'public.care_circles'::regclass
  ) THEN
    ALTER TABLE public.care_circles
      ADD CONSTRAINT care_circles_circle_type_check
      CHECK (circle_type IN ('care', 'family', 'household', 'team', 'group'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS care_circles_circle_type_idx
ON public.care_circles (circle_type);

COMMENT ON COLUMN public.care_circles.circle_type IS 'The product mode of the circle: care, family, household, team, group';
