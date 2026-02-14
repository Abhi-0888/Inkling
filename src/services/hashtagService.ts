import { supabase } from '@/integrations/supabase/client';

export interface HashtagStats {
    hashtag: string;
    count: number;
}

export const hashtagService = {
    /**
     * Get posts that contain a specific hashtag
     */
    async getPostsByHashtag(hashtag: string, limit: number = 20, offset: number = 0) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Normalize hashtag (remove # if present, convert to lowercase)
            const normalizedTag = hashtag.replace(/^#/, '').toLowerCase();

            const { data: posts, error } = await supabase
                .from('posts')
                .select(`
          *,
          author:users!posts_author_id_fkey(display_name)
        `)
                .contains('hashtags', [normalizedTag])
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            // Get stats for each post
            const postsWithStats = await Promise.all(
                (posts || []).map(async (post) => {
                    const [likesResult, commentsResult, userLikeResult] = await Promise.all([
                        supabase
                            .from('reactions')
                            .select('id', { count: 'exact', head: true })
                            .eq('post_id', post.id)
                            .eq('type', 'like'),
                        supabase
                            .from('comments')
                            .select('id', { count: 'exact', head: true })
                            .eq('post_id', post.id),
                        supabase
                            .from('reactions')
                            .select('id')
                            .eq('post_id', post.id)
                            .eq('user_id', user.id)
                            .eq('type', 'like')
                            .maybeSingle(),
                    ]);

                    return {
                        ...post,
                        like_count: likesResult.count || 0,
                        comment_count: commentsResult.count || 0,
                        user_has_liked: !!userLikeResult.data,
                        user_has_secret_liked: false,
                    };
                })
            );

            return postsWithStats;
        } catch (error) {
            console.error('Error fetching posts by hashtag:', error);
            return [];
        }
    },

    /**
     * Get trending hashtags with post counts
     */
    async getTrendingHashtags(limit: number = 10): Promise<HashtagStats[]> {
        try {
            // Get all posts with hashtags
            const { data: posts, error } = await supabase
                .from('posts')
                .select('hashtags')
                .not('hashtags', 'is', null)
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

            if (error) throw error;

            // Count hashtag occurrences
            const hashtagCounts = new Map<string, number>();

            posts?.forEach(post => {
                post.hashtags?.forEach((tag: string) => {
                    const count = hashtagCounts.get(tag) || 0;
                    hashtagCounts.set(tag, count + 1);
                });
            });

            // Convert to array and sort by count
            const trending = Array.from(hashtagCounts.entries())
                .map(([hashtag, count]) => ({ hashtag, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, limit);

            return trending;
        } catch (error) {
            console.error('Error fetching trending hashtags:', error);
            return [];
        }
    },

    /**
     * Get post count for a specific hashtag
     */
    async getHashtagPostCount(hashtag: string): Promise<number> {
        try {
            const normalizedTag = hashtag.replace(/^#/, '').toLowerCase();

            const { count, error } = await supabase
                .from('posts')
                .select('id', { count: 'exact', head: true })
                .contains('hashtags', [normalizedTag]);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Error getting hashtag count:', error);
            return 0;
        }
    },
};
