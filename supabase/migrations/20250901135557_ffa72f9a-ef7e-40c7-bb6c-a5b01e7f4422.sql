-- Add profile fields for identity verification
ALTER TABLE public.users 
ADD COLUMN full_name TEXT,
ADD COLUMN id_card_front_url TEXT,
ADD COLUMN id_card_back_url TEXT,
ADD COLUMN verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
ADD COLUMN verification_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN verification_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN phone_number TEXT,
ADD COLUMN date_of_birth DATE,
ADD COLUMN address TEXT;

-- Create storage bucket for ID card uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('id-cards', 'id-cards', false);

-- Create storage policies for ID card uploads
CREATE POLICY "Users can upload their own ID cards"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'id-cards' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own ID cards"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-cards' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admin can view all ID cards"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'id-cards');

-- Update the handle_new_user function to set verification status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.users (id, email, age_verified, verification_status)
  VALUES (new.id, new.email, true, 'pending');
  RETURN new;
END;
$$;