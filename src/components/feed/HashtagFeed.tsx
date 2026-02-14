import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostCard } from '@/components/feed/PostCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hash } from 'lucide-react';
import { hashtagService } from '@/services/hashtagService';
import { PostWithStats } from '@/services/postService';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export const HashtagFeed = () => {
    const { tag } = useParams<{ tag: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [posts, setPosts] = useState<PostWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [postCount, setPostCount] = useState(0);

    useEffect(() => {
        if (tag) {
            fetchPosts();
            fetchPostCount();
        }
    }, [tag]);

    const fetchPosts = async () => {
        if (!tag) return;

        setLoading(true);
        try {
            const fetchedPosts = await hashtagService.getPostsByHashtag(tag);
            setPosts(fetchedPosts);
        } catch (error) {
            console.error('Error fetching hashtag posts:', error);
            toast({
                title: "Error",
                description: "Failed to load posts. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchPostCount = async () => {
        if (!tag) return;
        const count = await hashtagService.getHashtagPostCount(tag);
        setPostCount(count);
    };

    const handleLike = async (postId: string) => {
        // Implement like toggle - reuse logic from Feed/DarkDesire
        fetchPosts();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pb-20">
                <div className="flex items-center justify-center pt-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Hash className="h-5 w-5 text-primary" />
                            <h1 className="text-xl font-bold">#{tag}</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {postCount} {postCount === 1 ? 'post' : 'posts'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Posts */}
            <div className="max-w-2xl mx-auto">
                {posts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12 px-4"
                    >
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Hash className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No posts yet for this topic</h3>
                        <p className="text-muted-foreground">
                            Be the first to post about #{tag}
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4 p-4">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={() => handleLike(post.id)}
                                onComment={(postId) => {
                                    // Navigate to comments or open dialog
                                    console.log('Comment on', postId);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
