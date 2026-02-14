-- Create users table for profiles
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  age_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Create posts table
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  section text NOT NULL CHECK (section IN ('feed', 'dark_desire')),
  kind text NOT NULL DEFAULT 'text' CHECK (kind IN ('text', 'image', 'poll')),
  content text NOT NULL,
  images text[] DEFAULT '{}',
  poll_options jsonb DEFAULT '{}',
  visibility text NOT NULL DEFAULT 'global' CHECK (visibility IN ('campus', 'global')),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone" 
ON public.posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- Create reactions table
CREATE TABLE public.reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'like',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(post_id, user_id, type)
);

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable by everyone" 
ON public.reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reactions" 
ON public.reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create matches table
CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  user_b_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_a_id, user_b_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches" 
ON public.matches 
FOR SELECT 
USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Create messages table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_ref text,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their matches" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE id = match_id 
    AND (user_a_id = auth.uid() OR user_b_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their matches" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM public.matches 
    WHERE id = match_id 
    AND (user_a_id = auth.uid() OR user_b_id = auth.uid())
  )
);

-- Create secret_likes table
CREATE TABLE public.secret_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  target_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(source_user_id, target_post_id)
);

ALTER TABLE public.secret_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own secret likes" 
ON public.secret_likes 
FOR INSERT 
WITH CHECK (auth.uid() = source_user_id);

-- Create blind_dates table
CREATE TABLE public.blind_dates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  user_b_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  active_until timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.blind_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blind dates" 
ON public.blind_dates 
FOR SELECT 
USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, age_verified)
  VALUES (new.id, new.email, true);
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();