
-- 1. Drop the overly permissive public SELECT policy on students
DROP POLICY IF EXISTS "Public can view graduated students for verification" ON public.students;

-- 2. Safe public lookup by student id (returns only non-sensitive fields)
CREATE OR REPLACE FUNCTION public.verify_student_by_id(_student_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  gender text,
  photo_url text,
  graduation_year integer,
  graduation_status public.graduation_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.full_name, s.gender, s.photo_url, s.graduation_year, s.graduation_status
  FROM public.students s
  WHERE s.id = _student_id
    AND s.deleted_at IS NULL
    AND s.graduation_status IN ('graduated', 'revoked');
$$;

-- 3. Safe public search by admission OR certificate number (only one match returned, no listing)
CREATE OR REPLACE FUNCTION public.search_student_for_verification(
  _search_type text,
  _search_value text
)
RETURNS TABLE (
  id uuid,
  full_name text,
  gender text,
  photo_url text,
  graduation_year integer,
  graduation_status public.graduation_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.full_name, s.gender, s.photo_url, s.graduation_year, s.graduation_status
  FROM public.students s
  WHERE s.deleted_at IS NULL
    AND s.graduation_status IN ('graduated', 'revoked')
    AND (
      (_search_type = 'admission'   AND s.admission_number   = _search_value) OR
      (_search_type = 'certificate' AND s.certificate_number = _search_value)
    )
  LIMIT 1;
$$;

-- 4. Allow anonymous + authenticated callers to use the safe functions
GRANT EXECUTE ON FUNCTION public.verify_student_by_id(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_student_for_verification(text, text) TO anon, authenticated;
