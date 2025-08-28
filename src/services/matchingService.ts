import { supabase } from '@/lib/supabase';

export interface MatchCandidate {
  id: string;
  bio?: string;
  interests?: string[];
  grad_year?: number;
}

export interface Match {
  id: string;
  user_a_id: string;
  user_b_id: string;
  match_type: 'secret_like' | 'swipe_match';
  created_at: string;
  unread_count: number;
  last_message?: {
    content: string;
    created_at: string;
  };
}

export const matchingService = {
  async getCandidates(): Promise<MatchCandidate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('id, grad_year')
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;

      return (data || []).map(candidate => ({
        id: candidate.id,
        grad_year: candidate.grad_year,
        bio: "Anonymous user",
        interests: [],
      }));
    } catch (error) {
      console.error('Error getting candidates:', error);
      return [];
    }
  },

  async swipe(candidateId: string, direction: 'like' | 'pass'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: candidateId,
          direction
        });

      if (swipeError) throw swipeError;
      return direction === 'like';
    } catch (error) {
      console.error('Error swiping:', error);
      throw error;
    }
  },

  async getMatches(): Promise<Match[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(match => ({
        id: match.id,
        user_a_id: match.user_a_id,
        user_b_id: match.user_b_id,
        match_type: match.match_type,
        created_at: match.created_at,
        unread_count: 0,
      }));
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  },

  async sendMessage(matchId: string, content: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getMessages(matchId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }
};