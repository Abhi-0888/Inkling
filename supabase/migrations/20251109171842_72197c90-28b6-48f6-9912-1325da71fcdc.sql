-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL, -- 'blind_date_match', 'match', 'like', 'comment', 'reaction'
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  reference_id uuid, -- ID of the related entity (match_id, post_id, etc.)
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_reference_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, reference_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_reference_id);
END;
$$;

-- Trigger for blind date matches
CREATE OR REPLACE FUNCTION public.notify_blind_date_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify when a match is actually formed (user_b_id changes from user_a_id to another user)
  IF OLD.user_b_id = OLD.user_a_id AND NEW.user_b_id != NEW.user_a_id THEN
    -- Notify user_a
    PERFORM create_notification(
      NEW.user_a_id,
      'blind_date_match',
      '🎭 Blind Date Match!',
      'You''ve been matched with someone for a 24-hour anonymous chat!',
      NEW.id
    );
    
    -- Notify user_b
    PERFORM create_notification(
      NEW.user_b_id,
      'blind_date_match',
      '🎭 Blind Date Match!',
      'You''ve been matched with someone for a 24-hour anonymous chat!',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_blind_date_match
AFTER UPDATE ON public.blind_dates
FOR EACH ROW
EXECUTE FUNCTION public.notify_blind_date_match();

-- Trigger for regular matches
CREATE OR REPLACE FUNCTION public.notify_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify both users
  PERFORM create_notification(
    NEW.user_a_id,
    'match',
    '💕 It''s a Match!',
    'You have a new match! Start chatting now.',
    NEW.id
  );
  
  PERFORM create_notification(
    NEW.user_b_id,
    'match',
    '💕 It''s a Match!',
    'You have a new match! Start chatting now.',
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_match_created
AFTER INSERT ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.notify_match();

-- Trigger for reactions on posts
CREATE OR REPLACE FUNCTION public.notify_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id uuid;
BEGIN
  -- Get the post author
  SELECT author_id INTO v_author_id
  FROM public.posts
  WHERE id = NEW.post_id;
  
  -- Don't notify if user reacts to their own post
  IF v_author_id != NEW.user_id THEN
    PERFORM create_notification(
      v_author_id,
      'reaction',
      '❤️ New Reaction',
      'Someone reacted to your post!',
      NEW.post_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_reaction_created
AFTER INSERT ON public.reactions
FOR EACH ROW
EXECUTE FUNCTION public.notify_reaction();

-- Trigger for comments on posts
CREATE OR REPLACE FUNCTION public.notify_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id uuid;
BEGIN
  -- Get the post author
  SELECT author_id INTO v_author_id
  FROM public.posts
  WHERE id = NEW.post_id;
  
  -- Don't notify if user comments on their own post
  IF v_author_id != NEW.user_id THEN
    PERFORM create_notification(
      v_author_id,
      'comment',
      '💬 New Comment',
      'Someone commented on your post!',
      NEW.post_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_created
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_comment();