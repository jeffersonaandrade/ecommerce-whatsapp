-- Cascade path/depth para descendentes ao mover ou renomear categoria pai

CREATE OR REPLACE FUNCTION public.category_subtree_relative_max_depth(p_id text)
RETURNS smallint
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE subtree AS (
    SELECT id, 0::smallint AS rel
    FROM public.categories
    WHERE id = p_id
    UNION ALL
    SELECT c.id, (s.rel + 1)::smallint
    FROM public.categories c
    JOIN subtree s ON c.parent_id = s.id
  )
  SELECT COALESCE(MAX(rel), 0)::smallint
  FROM subtree;
$$;

CREATE OR REPLACE FUNCTION public.refresh_category_subtree(p_root_id text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_parent_path text;
  v_parent_depth smallint;
  child record;
BEGIN
  SELECT path, depth
  INTO v_parent_path, v_parent_depth
  FROM public.categories
  WHERE id = p_root_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR child IN
    SELECT id, slug
    FROM public.categories
    WHERE parent_id = p_root_id
    ORDER BY sort_order, name
  LOOP
    UPDATE public.categories
    SET
      depth = v_parent_depth + 1,
      path = v_parent_path || '/' || child.slug
    WHERE id = child.id;

    PERFORM public.refresh_category_subtree(child.id);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_all_category_paths()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  root record;
BEGIN
  FOR root IN
    SELECT id, slug
    FROM public.categories
    WHERE parent_id IS NULL
    ORDER BY sort_order, name
  LOOP
    UPDATE public.categories
    SET depth = 0, path = root.slug
    WHERE id = root.id;

    PERFORM public.refresh_category_subtree(root.id);
  END LOOP;
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
    IF NEW.depth + v_relative > 2 THEN
      RAISE EXCEPTION 'category depth exceeds maximum of 3 levels';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.categories_cascade_paths_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
    AND (
      OLD.parent_id IS DISTINCT FROM NEW.parent_id
      OR OLD.slug IS DISTINCT FROM NEW.slug
    )
  THEN
    PERFORM public.refresh_category_subtree(NEW.id);
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS categories_cascade_paths ON public.categories;
CREATE TRIGGER categories_cascade_paths
  AFTER UPDATE OF parent_id, slug ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.categories_cascade_paths_trigger();

SELECT public.refresh_all_category_paths();

GRANT EXECUTE ON FUNCTION public.category_subtree_relative_max_depth(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refresh_category_subtree(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refresh_all_category_paths() TO authenticated, service_role;
