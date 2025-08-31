-- Add SELECT policy for secret_likes table to protect user privacy
-- Users can only see:
-- 1. Secret likes they have sent (to track their own activity)  
-- 2. Secret likes directed at them (needed for mutual like detection)

CREATE POLICY "Users can view their own secret likes and those directed at them"
ON public.secret_likes
FOR SELECT
USING (
  auth.uid() = source_user_id OR auth.uid() = target_user_id
);

-- Also add DELETE policy so users can remove their own secret likes if needed
CREATE POLICY "Users can delete their own secret likes"
ON public.secret_likes  
FOR DELETE
USING (auth.uid() = source_user_id);