-- 1) Function to check if a user is verified (avoids recursion in RLS)
CREATE OR REPLACE FUNCTION public.is_verified(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = _user_id AND u.verification_status = 'verified'
  );
$$;

-- 2) Allow verified users to view verified user profiles in users table
-- Keep existing self-profile policy; add an additional policy for verified-to-verified visibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Verified users can view verified profiles'
  ) THEN
    CREATE POLICY "Verified users can view verified profiles"
    ON public.users
    FOR SELECT
    USING (
      public.is_verified(auth.uid()) AND (verification_status = 'verified' OR id = auth.uid())
    );
  END IF;
END $$;

-- 3) Blind date improvements: allow viewing and claiming waiting sessions
-- Allow users to view available sessions (waiting = user_b_id = user_a_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'blind_dates' AND policyname = 'Users can view available blind date sessions'
  ) THEN
    CREATE POLICY "Users can view available blind date sessions"
    ON public.blind_dates
    FOR SELECT
    USING (
      user_b_id = user_a_id AND active_until > now()
    );
  END IF;
END $$;

-- Allow a user to claim a waiting session (set user_b_id to themselves)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'blind_dates' AND policyname = 'Users can claim waiting blind date sessions'
  ) THEN
    CREATE POLICY "Users can claim waiting blind date sessions"
    ON public.blind_dates
    FOR UPDATE
    USING (
      user_b_id = user_a_id AND active_until > now()
    )
    WITH CHECK (
      user_b_id = auth.uid() AND active_until > now()
    );
  END IF;
END $$;