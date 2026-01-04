INSERT INTO public.user_roles (user_id, role)
VALUES ('7f029d14-6fa4-43cd-92d1-585b8b165f11', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;