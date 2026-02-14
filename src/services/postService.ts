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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('posts')
        .select(`
          *,
          reactions!inner(count),
          comments!inner(count)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filter by visibility if needed
      if (visibility === 'campus') {
        query = query.eq('visibility', 'campus');
      }
      
      // Filter by section (default to 'feed')
      query = query.eq('section', 'feed');

      const { data: posts, error } = await query;

      if (error) throw error;

      // Get user's likes and reactions
      const postIds = (posts || []).map(p => p.id);
      let userReactions: any[] = [];
      
      if (postIds.length > 0) {
        const { data: reactions } = await supabase
          .from('reactions')
          .select('post_id, type')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        
        userReactions = reactions || [];
      }

      return (posts || []).map(post => {
        const userReaction = userReactions.find(r => r.post_id === post.id);
        return {
          ...post,
          section: post.section as 'feed' | 'dark_desire',
          like_count: Math.max(0, Math.floor(Math.random() * 50)), // TODO: Get actual count from aggregated reactions
          comment_count: Math.max(0, Math.floor(Math.random() * 20)), // TODO: Get actual count from aggregated comments
          user_has_liked: !!userReaction && userReaction.type === 'like',
          user_has_secret_liked: false, // TODO: Check secret likes
        };
      }) as PostWithStats[];
    } catch (error) {
      console.error('Error fetching feed posts:', error);
      return [];
    }
  },

  async createPost(content: string, kind: 'text' | 'image' | 'poll' = 'text', visibility: 'campus' | 'global' = 'campus', images: string[] = [], section: 'feed' | 'dark_desire' = 'feed'): Promise<Post | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // User is authenticated, proceed with post creation

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          kind,
          content,
          images,
          visibility,
          section
        })
        .select()
        .single();

      if (error) throw error;
      return data as Post;
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
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  async getDarkDesirePosts(limit: number = 20, offset: number = 0): Promise<PostWithStats[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          reactions!inner(count),
          comments!inner(count)
        `)
        .eq('section', 'dark_desire')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get user's likes and reactions
      const postIds = (posts || []).map(p => p.id);
      let userReactions: any[] = [];
      
      if (postIds.length > 0) {
        const { data: reactions } = await supabase
          .from('reactions')
          .select('post_id, type')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        
        userReactions = reactions || [];
      }

      return (posts || []).map(post => {
        const userReaction = userReactions.find(r => r.post_id === post.id);
        return {
          ...post,
          section: post.section as 'feed' | 'dark_desire',
          like_count: Math.max(0, Math.floor(Math.random() * 30)), // TODO: Get actual count from aggregated reactions
          comment_count: Math.max(0, Math.floor(Math.random() * 15)), // TODO: Get actual count from aggregated comments
          user_has_liked: !!userReaction && userReaction.type === 'like',
          user_has_secret_liked: false, // TODO: Check secret likes
        };
      }) as PostWithStats[];
    } catch (error) {
      console.error('Error fetching dark desire posts:', error);
      return [];
    }
  }
};