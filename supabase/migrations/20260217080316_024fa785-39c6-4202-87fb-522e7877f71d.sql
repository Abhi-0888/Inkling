
-- Fix infinite recursion in user_roles RLS policies
-- The current admin policies query user_roles to check if user is admin,
-- which triggers the same RLS check, causing infinite recursion.
-- Fix: use a SECURITY DEFINER function that bypasses RLS.

CREATE OR REPLACE FUNCTION public.check_is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- Drop and recreate user_roles policies using the new function
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (check_is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (check_is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (check_is_admin(auth.uid()));

-- Also add profile_completed column since it may be needed
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- Notify PostgREST to refresh schema cache
NOTIFY pgrst, 'reload schema';
