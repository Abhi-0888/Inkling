-- Fix 4: Restrict quiz_responses to owner-only and matched users
DROP POLICY IF EXISTS "Verified users can view quiz responses" ON public.quiz_responses;
DROP POLICY IF EXISTS "Users can view quiz responses for compatibility" ON public.quiz_responses;
DROP POLICY IF EXISTS "Verified users can view others responses for compatibility" ON public.quiz_responses;
DROP POLICY IF EXISTS "Users can view their own responses" ON public.quiz_responses;

-- Only the owner can view their own quiz responses
CREATE POLICY "Users can view own quiz responses"
ON public.quiz_responses FOR SELECT
USING (auth.uid() = user_id);

-- Users can view quiz responses of users they are matched with
CREATE POLICY "Users can view matched users quiz responses"
ON public.quiz_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_connections
    WHERE (user_a_id = auth.uid() AND user_b_id = quiz_responses.user_id)
       OR (user_b_id = auth.uid() AND user_a_id = quiz_responses.user_id)
  )
  OR EXISTS (
    SELECT 1 FROM public.matches
    WHERE (user_a_id = auth.uid() AND user_b_id = quiz_responses.user_id)
       OR (user_b_id = auth.uid() AND user_a_id = quiz_responses.user_id)
  )
);

-- Fix 5: Prevent self-matching in blind dates
DROP POLICY IF EXISTS "Users can claim waiting blind date sessions" ON public.blind_dates;

CREATE POLICY "Users can claim waiting blind date sessions"
ON public.blind_dates FOR UPDATE
USING (
  (user_b_id = user_a_id) 
  AND (active_until > now())
)
WITH CHECK (
  (user_b_id = auth.uid()) 
  AND (user_a_id != auth.uid())
  AND (active_until > now())
);