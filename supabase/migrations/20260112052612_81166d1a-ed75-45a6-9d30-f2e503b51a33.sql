-- =============================================
-- SPARK OF THE DAY - Daily curated matches
-- =============================================
CREATE TABLE public.spark_of_day (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  matched_user_id UUID NOT NULL REFERENCES auth.users(id),
  spark_date DATE NOT NULL DEFAULT CURRENT_DATE,
  revealed BOOLEAN NOT NULL DEFAULT false,
  revealed_at TIMESTAMP WITH TIME ZONE,
  compatibility_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, spark_date)
);

ALTER TABLE public.spark_of_day ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sparks"
ON public.spark_of_day FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create sparks"
ON public.spark_of_day FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sparks"
ON public.spark_of_day FOR UPDATE
USING (auth.uid() = user_id);

-- =============================================
-- CAMPUS EVENTS - Events & Meetups
-- =============================================
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_attendees INTEGER DEFAULT 50,
  category TEXT NOT NULL DEFAULT 'social',
  image_url TEXT,
  university_id UUID REFERENCES public.universities(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified users can view active events"
ON public.events FOR SELECT
USING (is_verified(auth.uid()) AND is_active = true);

CREATE POLICY "Verified users can create events"
ON public.events FOR INSERT
WITH CHECK (is_verified(auth.uid()) AND auth.uid() = creator_id);

CREATE POLICY "Creators can update their events"
ON public.events FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their events"
ON public.events FOR DELETE
USING (auth.uid() = creator_id);

-- Event RSVPs
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'going',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified users can view RSVPs"
ON public.event_rsvps FOR SELECT
USING (is_verified(auth.uid()));

CREATE POLICY "Users can RSVP to events"
ON public.event_rsvps FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_verified(auth.uid()));

CREATE POLICY "Users can update their RSVP"
ON public.event_rsvps FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their RSVP"
ON public.event_rsvps FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- VOICE NOTES - Audio profiles
-- =============================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS voice_intro_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS voice_intro_duration INTEGER;

-- =============================================
-- PHOTO VERIFICATION - Selfie verification
-- =============================================
CREATE TABLE public.photo_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  selfie_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.photo_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification"
ON public.photo_verifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit verification"
ON public.photo_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their verification"
ON public.photo_verifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications"
ON public.photo_verifications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update verifications"
ON public.photo_verifications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add verified badge to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_verified BOOLEAN DEFAULT false;

-- =============================================
-- COMPATIBILITY QUIZZES
-- =============================================
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'personality',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active quizzes"
ON public.quizzes FOR SELECT
USING (is_active = true);

CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  order_index INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions"
ON public.quiz_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = quiz_id AND is_active = true));

CREATE TABLE public.quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id),
  answers JSONB NOT NULL DEFAULT '{}',
  personality_type TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quiz_id)
);

ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own responses"
ON public.quiz_responses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit quiz responses"
ON public.quiz_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Verified users can view others responses for compatibility"
ON public.quiz_responses FOR SELECT
USING (is_verified(auth.uid()));

-- =============================================
-- CAMPUS POLLS - Weekly trending
-- =============================================
CREATE TABLE public.campus_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  category TEXT NOT NULL DEFAULT 'general',
  university_id UUID REFERENCES public.universities(id),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campus_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified users can view polls"
ON public.campus_polls FOR SELECT
USING (is_verified(auth.uid()));

CREATE POLICY "Verified users can create polls"
ON public.campus_polls FOR INSERT
WITH CHECK (is_verified(auth.uid()) AND auth.uid() = creator_id);

CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.campus_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view poll votes"
ON public.poll_votes FOR SELECT
USING (is_verified(auth.uid()));

CREATE POLICY "Users can vote"
ON public.poll_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- USER CONNECTIONS (for mutual friends)
-- =============================================
CREATE TABLE public.user_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a_id UUID NOT NULL REFERENCES auth.users(id),
  user_b_id UUID NOT NULL REFERENCES auth.users(id),
  connection_type TEXT NOT NULL DEFAULT 'friend',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_a_id, user_b_id)
);

ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their connections"
ON public.user_connections FOR SELECT
USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Users can create connections"
ON public.user_connections FOR INSERT
WITH CHECK (auth.uid() = user_a_id);

CREATE POLICY "Users can delete their connections"
ON public.user_connections FOR DELETE
USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-intros', 'voice-intros', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('selfie-verifications', 'selfie-verifications', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for voice intros
CREATE POLICY "Users can upload their voice intro"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'voice-intros' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view voice intros"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-intros');

CREATE POLICY "Users can update their voice intro"
ON storage.objects FOR UPDATE
USING (bucket_id = 'voice-intros' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their voice intro"
ON storage.objects FOR DELETE
USING (bucket_id = 'voice-intros' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for selfie verifications
CREATE POLICY "Users can upload selfie verification"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'selfie-verifications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own selfie"
ON storage.objects FOR SELECT
USING (bucket_id = 'selfie-verifications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all selfies"
ON storage.objects FOR SELECT
USING (bucket_id = 'selfie-verifications' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for event images
CREATE POLICY "Anyone can view event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Verified users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-images' AND is_verified(auth.uid()));

-- =============================================
-- SEED QUIZZES
-- =============================================
INSERT INTO public.quizzes (id, title, description, category) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Love Language Quiz', 'Discover how you express and receive love', 'personality'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Dating Style Quiz', 'Find out your dating personality type', 'dating'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Compatibility Check', 'See how you match with others', 'compatibility');

INSERT INTO public.quiz_questions (quiz_id, question, options, order_index) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'How do you prefer to show affection?', '["Physical touch", "Words of affirmation", "Acts of service", "Quality time", "Giving gifts"]', 0),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'What makes you feel most loved?', '["Hearing \"I love you\"", "A surprise gift", "A long hug", "Help with tasks", "Undivided attention"]', 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'On a perfect date, you''d prefer...', '["Deep conversation", "Holding hands walking", "Receiving a thoughtful gift", "Partner cooking for you", "Quality time together"]', 2),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'What''s your ideal first date?', '["Coffee and conversation", "Adventure activity", "Fancy dinner", "Casual hangout", "Creative activity"]', 0),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'How quickly do you open up to someone?', '["Immediately", "After a few dates", "Takes a while", "Very slowly", "Depends on vibes"]', 1),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'What''s most important in a partner?', '["Sense of humor", "Ambition", "Kindness", "Intelligence", "Adventurous spirit"]', 0),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'How do you handle conflicts?', '["Talk it out immediately", "Need time to process", "Avoid confrontation", "Find compromise", "Depends on the issue"]', 1);

-- Seed a featured poll
INSERT INTO public.campus_polls (question, options, category, is_featured, ends_at) VALUES
('What''s the best study spot on campus?', '["Library", "Coffee shop", "Outdoor quad", "Dorm room", "Empty classroom"]', 'campus_life', true, now() + interval '7 days');