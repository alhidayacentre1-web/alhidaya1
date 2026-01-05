-- Create graduation_years table for admin to manage available years
CREATE TABLE public.graduation_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.graduation_years ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view graduation years"
ON public.graduation_years
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert graduation years"
ON public.graduation_years
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update graduation years"
ON public.graduation_years
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can delete graduation years"
ON public.graduation_years
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));