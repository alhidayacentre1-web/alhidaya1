-- Add gender column to students table
ALTER TABLE public.students 
ADD COLUMN gender text NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female'));

-- Add soft delete column
ALTER TABLE public.students 
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Update RLS policy to exclude deleted students from public view
DROP POLICY IF EXISTS "Public can view graduated students for verification" ON public.students;
CREATE POLICY "Public can view graduated students for verification" 
ON public.students 
FOR SELECT 
USING (
  (graduation_status = 'graduated'::graduation_status OR graduation_status = 'revoked'::graduation_status)
  AND deleted_at IS NULL
);