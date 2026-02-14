
-- Add new profile fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS class_of_year integer;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests text[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS unpopular_opinion text;
