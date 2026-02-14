-- Add gender and display_name to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS display_name text;

-- Generate random display names for existing users
UPDATE public.users
SET display_name = CASE 
  WHEN display_name IS NULL THEN 
    (ARRAY['Alex', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Avery', 'Quinn', 'Blake', 'Skyler', 'River', 'Phoenix', 'Sage', 'Dakota', 'Rowan'])[floor(random() * 15 + 1)]
  ELSE display_name
END
WHERE display_name IS NULL;

-- Add RLS policies for blind_dates table
DROP POLICY IF EXISTS "Users can create blind date sessions" ON public.blind_dates;
CREATE POLICY "Users can create blind date sessions"
ON public.blind_dates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_a_id);

DROP POLICY IF EXISTS "Users can update blind date sessions" ON public.blind_dates;
CREATE POLICY "Users can update blind date sessions"
ON public.blind_dates
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_a_id) OR (auth.uid() = user_b_id));

-- Add RLS policies for matches table
DROP POLICY IF EXISTS "Users can create matches" ON public.matches;
CREATE POLICY "Users can create matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() = user_a_id) OR (auth.uid() = user_b_id));

-- Enable realtime for posts, reactions, comments, and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blind_dates;

-- Set replica identity for realtime updates
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.reactions REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.blind_dates REPLICA IDENTITY FULL;