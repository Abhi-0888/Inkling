-- Create trigger to notify users to complete profile after verification
CREATE OR REPLACE FUNCTION public.notify_profile_setup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only create notification if verification status changed to 'verified'
  IF NEW.verification_status = 'verified' AND (OLD.verification_status IS NULL OR OLD.verification_status != 'verified') THEN
    INSERT INTO public.notifications (user_id, type, title, message, read)
    VALUES (
      NEW.id,
      'profile_setup',
      'Profile Setup Required',
      'Your account is verified. Please complete your profile to start matching.',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on users table
DROP TRIGGER IF EXISTS on_user_verified ON public.users;
CREATE TRIGGER on_user_verified
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_profile_setup();
