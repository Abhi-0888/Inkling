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
  created_at: string;
  match_type?: string;
  unread_count?: number;
  last_message?: string;
}

export const matchingService = {
  async getCandidates(): Promise<MatchCandidate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current user's gender
      const { data: currentUser } = await supabase
        .from('users')
        .select('gender')
        .eq('id', user.id)
        .single();

      if (!currentUser?.gender) {
        throw new Error('Please set your gender in profile settings first');
      }

      // Get opposite gender users
      const oppositeGender = currentUser.gender === 'male' ? 'female' : currentUser.gender === 'female' ? 'male' : null;
      
      // Get users excluding current user and already matched users
      const { data: existingMatches } = await supabase
        .from('matches')
        .select('user_a_id, user_b_id')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);

      const matchedUserIds = new Set(
        (existingMatches || []).flatMap(m => [m.user_a_id, m.user_b_id]).filter(id => id !== user.id)
      );

      const { data: users, error } = await supabase
        .from('users')
        .select('id, display_name, email')
        .neq('id', user.id)
        .eq('gender', oppositeGender || currentUser.gender)
        .eq('verification_status', 'verified')
        .limit(20);

      if (error) throw error;

      // Filter out already matched users
      const availableUsers = (users || []).filter(u => !matchedUserIds.has(u.id));

      // Return candidates with display names
      return availableUsers.map((user) => ({
        id: user.id,
        bio: `Looking for meaningful connections and good conversations! Love exploring new places and trying different cuisines.`,
        interests: ['Music', 'Travel', 'Food', 'Books', 'Movies'].slice(0, Math.floor(Math.random() * 3) + 2),
        grad_year: 2024 + Math.floor(Math.random() * 4)
      }));
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }
  },

  async swipe(candidateId: string, direction: 'like' | 'pass'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // For now, simulate match behavior
      // In a real app, you'd store the swipe and check for mutual likes
      if (direction === 'like') {
        // 30% chance of getting a match
        const isMatch = Math.random() < 0.3;
        
        if (isMatch) {
          // Create a match record
          const { error } = await supabase
            .from('matches')
            .insert({
              user_a_id: user.id,
              user_b_id: candidateId
            });
          
          if (error) throw error;
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error processing swipe:', error);
      return false;
    }
  },

  async getMatches(): Promise<Match[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (matches || []).map(match => ({
        ...match,
        match_type: 'regular',
        unread_count: 0,
        last_message: 'Start your conversation...'
      }));
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  },

  async sendMessage(matchId: string, content: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }
};