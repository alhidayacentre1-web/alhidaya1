-- Add photo_url column to students table
ALTER TABLE public.students ADD COLUMN photo_url TEXT;

-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-photos', 'student-photos', true);

-- Create storage policies for student photos
CREATE POLICY "Admin can upload student photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-photos' AND EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'super_admin'
));

CREATE POLICY "Admin can update student photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'student-photos' AND EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'super_admin'
));

CREATE POLICY "Admin can delete student photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'student-photos' AND EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'super_admin'
));

CREATE POLICY "Anyone can view student photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');