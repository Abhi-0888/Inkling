import { supabase } from '@/lib/supabase';
import { Post, Reaction, Comment } from '@/lib/supabase';
import { z } from 'zod';

const postSchema = z.object({
  content: z.string()
    .min(1, "Content cannot be empty")
    .max(5000, "Content must be less than 5000 characters")
    .trim(),
});

const commentSchema = z.object({
  content: z.string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be less than 1000 characters")
    .trim(),
});

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

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!posts_author_id_fkey(display_name)
        `)
        .eq('section', 'feed')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const postIds = (posts || []).map(p => p.id);
      
      // Get reactions count for each post
      const { data: reactions } = await supabase
        .from('reactions')
        .select('post_id, user_id, type')
        .in('post_id', postIds);

      // Get comments count for each post
      const { data: comments } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);

      return (posts || []).map(post => {
        const postReactions = reactions?.filter(r => r.post_id === post.id) || [];
        const postComments = comments?.filter(c => c.post_id === post.id) || [];
        const userReaction = postReactions.find(r => r.user_id === user.id);

        return {
          ...post,
          section: post.section as 'feed' | 'dark_desire',
          like_count: postReactions.filter(r => r.type === 'like').length,
          comment_count: postComments.length,
          user_has_liked: !!userReaction && userReaction.type === 'like',
          user_has_secret_liked: false,
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

      // Validate content
      try {
        postSchema.parse({ content });
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(error.errors[0].message);
        }
        throw error;
      }

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

      // Validate content
      try {
        commentSchema.parse({ content });
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(error.errors[0].message);
        }
        throw error;
      }

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

  async getComments(postId: string): Promise<(Comment & { user?: { display_name: string } })[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users!comments_user_id_fkey(display_name)
        `)
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
          author:users!posts_author_id_fkey(display_name)
        `)
        .eq('section', 'dark_desire')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const postIds = (posts || []).map(p => p.id);
      
      // Get reactions count for each post
      const { data: reactions } = await supabase
        .from('reactions')
        .select('post_id, user_id, type')
        .in('post_id', postIds);

      // Get comments count for each post
      const { data: comments } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);

      return (posts || []).map(post => {
        const postReactions = reactions?.filter(r => r.post_id === post.id) || [];
        const postComments = comments?.filter(c => c.post_id === post.id) || [];
        const userReaction = postReactions.find(r => r.user_id === user.id);

        return {
          ...post,
          section: post.section as 'feed' | 'dark_desire',
          like_count: postReactions.filter(r => r.type === 'like').length,
          comment_count: postComments.length,
          user_has_liked: !!userReaction && userReaction.type === 'like',
          user_has_secret_liked: false,
        };
      }) as PostWithStats[];
    } catch (error) {
      console.error('Error fetching dark desire posts:', error);
      return [];
    }
  }
};