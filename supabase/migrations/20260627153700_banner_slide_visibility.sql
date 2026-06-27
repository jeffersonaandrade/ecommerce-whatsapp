-- Banner slide visibility per device (all | desktop | mobile)

ALTER TABLE public.banner_slides
ALTER COLUMN desktop_image_path DROP NOT NULL;

ALTER TABLE public.banner_slides
ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'all';

ALTER TABLE public.banner_slides
DROP CONSTRAINT IF EXISTS banner_slides_visibility_check;

ALTER TABLE public.banner_slides
ADD CONSTRAINT banner_slides_visibility_check
CHECK (visibility IN ('all', 'desktop', 'mobile'));
