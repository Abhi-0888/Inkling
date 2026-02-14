-- Fix RLS policy for messages to support both matches and blind_dates
DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;

-- Create new policies that support both regular matches and blind dates
CREATE POLICY "Users can send messages in their chats"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND (
    -- Check if user is part of a regular match
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
    OR
    -- Check if user is part of a blind date
    EXISTS (
      SELECT 1 FROM blind_dates
      WHERE blind_dates.id = messages.match_id
      AND (blind_dates.user_a_id = auth.uid() OR blind_dates.user_b_id = auth.uid())
      AND blind_dates.active_until > now()
    )
  )
);

CREATE POLICY "Users can view messages in their chats"
ON messages FOR SELECT
USING (
  -- Check if user is part of a regular match
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = messages.match_id
    AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
  )
  OR
  -- Check if user is part of a blind date
  EXISTS (
    SELECT 1 FROM blind_dates
    WHERE blind_dates.id = messages.match_id
    AND (blind_dates.user_a_id = auth.uid() OR blind_dates.user_b_id = auth.uid())
  )
);