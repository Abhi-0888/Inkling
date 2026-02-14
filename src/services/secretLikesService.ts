import { supabase } from '@/lib/supabase';
import { SecretLike, Match, Message } from '@/lib/supabase';

export interface SecretLikeInbox {
  id: string;
  post_id: string;
  post_content: string;
  post_created_at: string;
  secret_like_created_at: string;
  has_matched: boolean;
}

export const secretLikesService = {
  async sendSecretLike(targetPostId?: string, targetUserId?: string): Promise<SecretLike | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (!targetPostId && !targetUserId) {
        throw new Error('Must specify either target post or target user');
      }

      const { data, error } = await supabase
        .from('secret_likes')
        .insert({
          source_user_id: user.id,
          target_post_id: targetPostId,
          target_user_id: targetUserId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending secret like:', error);
      throw error;
    }
  },

  async getSecretLikesInbox(): Promise<SecretLikeInbox[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get secret likes on my posts
      const { data, error } = await supabase
        .from('secret_likes')
        .select(`
          id,
          source_user_id,
          target_post_id,
          created_at,
          posts!inner(
            id,
            content,
            created_at,
            author_id
          )
        `)
        .eq('posts.author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data and check for matches
      const inbox: SecretLikeInbox[] = [];
      for (const like of data || []) {
        // Check if there's a mutual match
        const { data: match } = await supabase
          .from('matches')
          .select('id')
          .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
          .or(`user_a_id.eq.${like.source_user_id},user_b_id.eq.${like.source_user_id}`)
          .single();

        inbox.push({
          id: like.id,
          post_id: like.target_post_id,
          post_content: (like.posts as any).content,
          post_created_at: (like.posts as any).created_at,
          secret_like_created_at: like.created_at,
          has_matched: !!match
        });
      }

      return inbox;
    } catch (error) {
      console.error('Error fetching secret likes inbox:', error);
      return [];
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
      return data || [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  },

  async getMessages(matchId: string): Promise<Message[]> {
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
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(matchId: string, content: string): Promise<Message | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};