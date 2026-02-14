import { supabase } from "@/integrations/supabase/client";

export const uploadVoiceIntro = async (audioBlob: Blob): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const fileName = `${user.id}/voice-intro-${Date.now()}.webm`;

  const { error: uploadError } = await supabase.storage
    .from('voice-intros')
    .upload(fileName, audioBlob, {
      contentType: 'audio/webm',
      upsert: true
    });

  if (uploadError) {
    console.error('Error uploading voice intro:', uploadError);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('voice-intros')
    .getPublicUrl(fileName);

  // Update user profile
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      voice_intro_url: publicUrl,
      voice_intro_duration: Math.round(audioBlob.size / 1000) // rough estimate
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating profile:', updateError);
    return null;
  }

  return publicUrl;
};

export const deleteVoiceIntro = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Get current voice intro URL to delete file
  const { data: profile } = await supabase
    .from('users')
    .select('voice_intro_url')
    .eq('id', user.id)
    .single();

  if (profile?.voice_intro_url) {
    const path = profile.voice_intro_url.split('/').slice(-2).join('/');
    await supabase.storage.from('voice-intros').remove([path]);
  }

  const { error } = await supabase
    .from('users')
    .update({ 
      voice_intro_url: null,
      voice_intro_duration: null
    })
    .eq('id', user.id);

  return !error;
};

export const getVoiceIntro = async (userId: string): Promise<string | null> => {
  const { data } = await supabase
    .from('users')
    .select('voice_intro_url')
    .eq('id', userId)
    .single();

  return data?.voice_intro_url || null;
};
