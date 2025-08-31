-- Fix the security issue by setting search_path properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, age_verified)
  VALUES (new.id, new.email, true);
  RETURN new;
END;
$$;