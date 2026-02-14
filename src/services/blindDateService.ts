import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type BlindDate = Database['public']['Tables']['blind_dates']['Row'];

export interface BlindDateSession extends BlindDate {
  status?: 'active' | 'ended' | 'expired';
  expires_at?: string;
}

export const blindDateService = {
  async joinQueue(): Promise<BlindDateSession | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      // Get current user's gender
      const { data: currentUser } = await supabase
        .from('users')
        .select('gender')
        .eq('id', user.id)
        .single();

      if (!currentUser?.gender) {
        throw new Error('Please set your gender in profile settings first');
      }

      // Determine opposite gender for filtering
      const oppositeGender = currentUser.gender === 'male' ? 'female' : currentUser.gender === 'female' ? 'male' : null;
      
      if (!oppositeGender) {
        throw new Error('Blind dates are only available for male/female users');
      }

      // Get all waiting users to filter by gender
      const { data: waitingUsers, error: queueError } = await supabase
        .from('blind_dates')
        .select(`
          *,
          user_a:users!blind_dates_user_a_id_fkey(gender)
        `)
        .gte('active_until', new Date().toISOString())
        .neq('user_a_id', user.id);

      if (queueError) throw queueError;

      // Filter for users waiting alone (user_b_id equals user_a_id) with opposite gender
      const waitingUser = waitingUsers?.find(session => 
        session.user_b_id === session.user_a_id && 
        session.user_a?.gender === oppositeGender
      );

      if (waitingUser) {
        // Match with the waiting user
        const activeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
        
        const { data: session, error } = await supabase
          .from('blind_dates')
          .update({
            user_b_id: user.id,
            active_until: activeUntil
          })
          .eq('id', waitingUser.id)
          .select()
          .single();

        if (error) throw error;
        return session;
      } else {
        // Create a new session and wait for a match
        const activeUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes timeout

        const { data: session, error } = await supabase
          .from('blind_dates')
          .insert({
            user_a_id: user.id,
            user_b_id: user.id, // Will be updated when someone joins
            active_until: activeUntil
          })
          .select()
          .single();

        if (error) throw error;
        return session;
      }
    } catch (error) {
      console.error('Error joining blind date queue:', error);
      throw error;
    }
  },

  async getActiveSession(): Promise<BlindDateSession | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('blind_dates')
        .select('*')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .gte('active_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data || null;
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  },

  async endSession(sessionId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('blind_dates')
        .update({ active_until: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  },

  async sendMessage(sessionId: string, content: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: sessionId,
          sender_id: user.id,
          content
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getMessages(sessionId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  async findMatch(): Promise<BlindDateSession | null> {
    return await this.joinQueue();
  }
};