import { supabase } from '@/lib/supabase';

export interface BlindDateSession {
  id: string;
  user_a_id: string;
  user_b_id: string;
  status: 'active' | 'ended' | 'expired';
  expires_at: string;
  created_at: string;
  ended_at: string | null;
}

export const blindDateService = {
  async findMatch(): Promise<BlindDateSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Add user to queue
      await supabase
        .from('blind_date_queue')
        .upsert({ user_id: user.id });

      // Try to find a match using the database function
      const { data, error } = await supabase.rpc('find_blind_date_match', {
        requesting_user_id: user.id
      });

      if (error) throw error;

      // If we got a match, fetch the session details
      if (data) {
        return await this.getActiveSession();
      }

      return null;
    } catch (error) {
      console.error('Error finding blind date match:', error);
      throw error;
    }
  },

  async getActiveSession(): Promise<BlindDateSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('blind_dates')
        .select('*')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  },

  async endSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blind_dates')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  },

  async sendMessage(sessionId: string, content: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          blind_date_id: sessionId,
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
        .eq('blind_date_id', sessionId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  async joinQueue(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('blind_date_queue')
        .upsert({ user_id: user.id });

      if (error) throw error;
    } catch (error) {
      console.error('Error joining queue:', error);
      throw error;
    }
  },

  async leaveQueue(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('blind_date_queue')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving queue:', error);
      throw error;
    }
  }
};