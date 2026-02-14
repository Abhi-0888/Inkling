import { supabase } from '@/lib/supabase';
import { Post, Reaction, Comment } from '@/lib/supabase';

export interface PostWithStats extends Post {
  like_count: number;
  comment_count: number;
  user_has_liked: boolean;
  user_has_secret_liked: boolean;
}

export const postService = {
  async getFeedPosts(instituteId?: string, visibility: 'campus' | 'global' = 'campus', limit: number = 20, offset: number = 0): Promise<PostWithStats[]> {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          reactions(count),
          comments(count)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (visibility === 'campus' && instituteId) {
        query = query.eq('institute_id', instituteId);
      }

      const { data: posts, error } = await query;

      if (error) throw error;

      // For now, return mock data structure until we have the proper RPC function
      return (posts || []).map(post => ({
        ...post,
        like_count: Math.floor(Math.random() * 50),
        comment_count: Math.floor(Math.random() * 20),
        user_has_liked: false,
        user_has_secret_liked: false,
      }));
    } catch (error) {
      console.error('Error fetching feed posts:', error);
      return [];
    }
  },

  async createPost(content: string, kind: 'text' | 'image' | 'poll' = 'text', visibility: 'campus' | 'global' = 'campus', images: string[] = []): Promise<Post | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userProfile } = await supabase
        .from('users')
        .select('institute_id')
        .eq('id', user.id)
        .single();

      if (!userProfile) throw new Error('User profile not found');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          institute_id: userProfile.institute_id,
          kind,
          content,
          images,
          visibility
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async toggleLike(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already liked this post
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('type', 'like')
        .single();

      if (existingReaction) {
        // Unlike
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('id', existingReaction.id);
        
        if (error) throw error;
        return false;
      } else {
        // Like
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            type: 'like'
          });
        
        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  async addComment(postId: string, content: string): Promise<Comment | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async getComments(postId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }
};