-- Add hashtags array to posts table and create index for efficient hashtag queries
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS hashtags text[] DEFAULT '{}';

-- Create GIN index for efficient hashtag searches
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON public.posts USING GIN (hashtags);

COMMENT ON COLUMN public.posts.hashtags IS 'Array of hashtags extracted from post content';
