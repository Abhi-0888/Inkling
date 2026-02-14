-- Add current_vibe field to users table to store user's daily vibe selection
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS current_vibe jsonb;

COMMENT ON COLUMN public.users.current_vibe IS 'Stores user vibe as {icon: string, label: string}';
