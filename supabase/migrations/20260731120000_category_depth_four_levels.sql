-- Expand category hierarchy: 4 visual levels (depth 0–3), not unlimited tree

ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_depth_check;
ALTER TABLE public.categories
  ADD CONSTRAINT categories_depth_check CHECK (depth BETWEEN 0 AND 3);

CREATE OR REPLACE FUNCTION public.refresh_category_path_for_row(
  p_id text,
  p_parent_id text,
  p_slug text
)
RETURNS TABLE(depth smallint, path text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_parent_depth smallint := -1;
  v_parent_path text := '';
  v_depth smallint;
  v_path text;
BEGIN
  IF p_parent_id IS NULL THEN
    v_depth := 0;
    v_path := p_slug;
  ELSE
    SELECT c.depth, c.path
    INTO v_parent_depth, v_parent_path
    FROM public.categories c
    WHERE c.id = p_parent_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'parent category not found';
    END IF;

    v_depth := v_parent_depth + 1;
    IF v_depth > 3 THEN
      RAISE EXCEPTION 'category depth exceeds maximum of 4 levels';
    END IF;

    v_path := v_parent_path || '/' || p_slug;
  END IF;

  RETURN QUERY SELECT v_depth, v_path;
END;
$$;

CREATE OR REPLACE FUNCTION public.categories_refresh_path_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_fields record;
  v_relative smallint;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'category cannot be its own parent';
    END IF;

    IF EXISTS (
      WITH RECURSIVE descendants AS (
        SELECT id
        FROM public.categories
        WHERE parent_id = NEW.id
        UNION ALL
        SELECT c.id
        FROM public.categories c
        JOIN descendants d ON c.parent_id = d.id
      )
      SELECT 1
      FROM descendants
      WHERE id = NEW.parent_id
    ) THEN
      RAISE EXCEPTION 'cannot move category under descendant';
    END IF;
  END IF;

  SELECT * INTO v_fields
  FROM public.refresh_category_path_for_row(NEW.id, NEW.parent_id, NEW.slug);

  NEW.depth := v_fields.depth;
  NEW.path := v_fields.path;

  IF TG_OP = 'UPDATE'
    AND (
      OLD.parent_id IS DISTINCT FROM NEW.parent_id
      OR OLD.slug IS DISTINCT FROM NEW.slug
    )
  THEN
    v_relative := public.category_subtree_relative_max_depth(NEW.id);
    IF NEW.depth + v_relative > 3 THEN
      RAISE EXCEPTION 'category depth exceeds maximum of 4 levels';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
