-- Create universities table for multi-college scaling
CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL DEFAULT 'Unknown',
  domain TEXT, -- e.g., 'stanford.edu' for email verification
  verification_method TEXT NOT NULL DEFAULT 'id_card',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add university_id to users table
ALTER TABLE public.users ADD COLUMN university_id UUID REFERENCES public.universities(id);

-- Create trust_scores table (internal only, never exposed)
CREATE TABLE public.trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 100,
  total_likes_received INTEGER NOT NULL DEFAULT 0,
  total_reports_against INTEGER NOT NULL DEFAULT 0,
  total_blocks_received INTEGER NOT NULL DEFAULT 0,
  positive_interactions INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'chat', 'user')),
  reason TEXT NOT NULL CHECK (reason IN ('harassment', 'hate_abuse', 'sexual_content', 'spam', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bans table
CREATE TABLE public.bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ban_type TEXT NOT NULL CHECK (ban_type IN ('shadow', 'temporary', 'permanent')),
  reason TEXT NOT NULL,
  issued_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ, -- NULL for permanent bans
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_strikes table for strike system
CREATE TABLE public.user_strikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.reports(id),
  reason TEXT NOT NULL,
  issued_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create flagged_content table for auto-moderation
CREATE TABLE public.flagged_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'chat_message')),
  flag_reason TEXT NOT NULL,
  auto_flagged BOOLEAN NOT NULL DEFAULT true,
  reviewed BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_strikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_content ENABLE ROW LEVEL SECURITY;

-- Universities policies (public read, admin write)
CREATE POLICY "Anyone can view active universities" ON public.universities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage universities" ON public.universities
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Trust scores policies (only system/admins can access)
CREATE POLICY "Admins can view trust scores" ON public.trust_scores
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update trust scores" ON public.trust_scores
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Reports policies
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins and moderators can view all reports" ON public.reports
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can update reports" ON public.reports
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Bans policies (admin only)
CREATE POLICY "Admins can manage bans" ON public.bans
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can view bans" ON public.bans
  FOR SELECT USING (has_role(auth.uid(), 'moderator'));

-- User strikes policies
CREATE POLICY "Admins can manage strikes" ON public.user_strikes
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can view strikes" ON public.user_strikes
  FOR SELECT USING (has_role(auth.uid(), 'moderator'));

CREATE POLICY "Users can view their own strikes" ON public.user_strikes
  FOR SELECT USING (auth.uid() = user_id);

-- Flagged content policies
CREATE POLICY "Admins and moderators can view flagged content" ON public.flagged_content
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can update flagged content" ON public.flagged_content
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bans
    WHERE user_id = _user_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Function to get user strike count
CREATE OR REPLACE FUNCTION public.get_strike_count(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.user_strikes
  WHERE user_id = _user_id
$$;

-- Function to initialize trust score for new users
CREATE OR REPLACE FUNCTION public.init_trust_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trust_scores (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create trust score when user is created
CREATE TRIGGER on_user_created_init_trust
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.init_trust_score();

-- Create indexes for performance
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_content ON public.reports(content_id, content_type);
CREATE INDEX idx_bans_user ON public.bans(user_id, is_active);
CREATE INDEX idx_trust_scores_user ON public.trust_scores(user_id);
CREATE INDEX idx_user_strikes_user ON public.user_strikes(user_id);
CREATE INDEX idx_flagged_content_reviewed ON public.flagged_content(reviewed);
CREATE INDEX idx_users_university ON public.users(university_id);