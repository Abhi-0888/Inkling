import { supabase } from "@/integrations/supabase/client";

export interface SparkOfDay {
  id: string;
  user_id: string;
  matched_user_id: string;
  spark_date: string;
  revealed: boolean;
  revealed_at: string | null;
  compatibility_score: number;
  created_at: string;
  matched_user?: {
    id: string;
    display_name: string | null;
    photo_verified: boolean;
  };
}

export const getTodaySpark = async (userId: string): Promise<SparkOfDay | null> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('spark_of_day')
    .select('*')
    .eq('user_id', userId)
    .eq('spark_date', today)
    .maybeSingle();

  if (error) {
    console.error('Error fetching spark:', error);
    return null;
  }

  if (!data) return null;

  // Fetch matched user info separately
  const { data: matchedUser } = await supabase
    .from('users')
    .select('id, display_name, photo_verified')
    .eq('id', data.matched_user_id)
    .single();

  return {
    ...data,
    matched_user: matchedUser || undefined
  } as SparkOfDay;
};

export const generateDailySpark = async (userId: string): Promise<SparkOfDay | null> => {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if already has spark for today
  const existing = await getTodaySpark(userId);
  if (existing) return existing;

  // Get a random verified user that's not the current user
  const { data: potentialMatches, error: matchError } = await supabase
    .from('users')
    .select('id')
    .neq('id', userId)
    .eq('verification_status', 'verified')
    .limit(10);

  if (matchError || !potentialMatches?.length) {
    console.error('No potential matches found:', matchError);
    return null;
  }

  // Pick random user
  const randomMatch = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];
  const compatibilityScore = Math.floor(Math.random() * 40) + 60; // 60-100

  const { data, error } = await supabase
    .from('spark_of_day')
    .insert({
      user_id: userId,
      matched_user_id: randomMatch.id,
      spark_date: today,
      compatibility_score: compatibilityScore
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating spark:', error);
    return null;
  }

  return data;
};

export const revealSpark = async (sparkId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('spark_of_day')
    .update({ 
      revealed: true, 
      revealed_at: new Date().toISOString() 
    })
    .eq('id', sparkId);

  return !error;
};
