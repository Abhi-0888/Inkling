import { supabase } from "@/integrations/supabase/client";

export interface PhotoVerification {
  id: string;
  user_id: string;
  selfie_url: string;
  status: 'pending' | 'approved' | 'rejected';
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export const submitPhotoVerification = async (selfieBlob: Blob): Promise<PhotoVerification | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const fileName = `${user.id}/selfie-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('selfie-verifications')
    .upload(fileName, selfieBlob, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (uploadError) {
    console.error('Error uploading selfie:', uploadError);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('selfie-verifications')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('photo_verifications')
    .upsert({
      user_id: user.id,
      selfie_url: publicUrl,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting verification:', error);
    return null;
  }

  return data as PhotoVerification;
};

export const getPhotoVerificationStatus = async (): Promise<PhotoVerification | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('photo_verifications')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return data as PhotoVerification | null;
};

export const isPhotoVerified = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('users')
    .select('photo_verified')
    .eq('id', userId)
    .single();

  return data?.photo_verified || false;
};

// Admin functions
export const getPendingVerifications = async (): Promise<PhotoVerification[]> => {
  const { data, error } = await supabase
    .from('photo_verifications')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching verifications:', error);
    return [];
  }

  return data as PhotoVerification[];
};

export const approvePhotoVerification = async (userId: string): Promise<boolean> => {
  const { data: { user: admin } } = await supabase.auth.getUser();
  if (!admin) return false;

  const { error: verifyError } = await supabase
    .from('photo_verifications')
    .update({
      status: 'approved',
      verified_at: new Date().toISOString(),
      verified_by: admin.id
    })
    .eq('user_id', userId);

  if (verifyError) return false;

  const { error: userError } = await supabase
    .from('users')
    .update({ photo_verified: true })
    .eq('id', userId);

  return !userError;
};

export const rejectPhotoVerification = async (userId: string, reason: string): Promise<boolean> => {
  const { data: { user: admin } } = await supabase.auth.getUser();
  if (!admin) return false;

  const { error } = await supabase
    .from('photo_verifications')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      verified_at: new Date().toISOString(),
      verified_by: admin.id
    })
    .eq('user_id', userId);

  return !error;
};
