import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Sparkles, TrendingUp } from 'lucide-react';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { postService, PostWithStats } from '@/services/postService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FeedProps {
  onPostClick: (postId: string) => void;
}

export const Feed = ({ onPostClick }: FeedProps) => {
  const [posts, setPosts] = useState<PostWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [activeTab, setActiveTab] = useState('foryou');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [activeTab, user]);

  const fetchPosts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const fetchedPosts = await postService.getFeedPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading feed",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const newLikeState = await postService.toggleLike(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              user_has_liked: newLikeState,
              like_count: newLikeState ? post.like_count + 1 : post.like_count - 1
            }
          : post
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSecretLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const { error } = await supabase
        .from('secret_likes')
        .insert({
          source_user_id: user.id,
          target_post_id: postId,
          target_user_id: post.author_id
        });

      if (error) throw error;

      // Check for mutual secret like
      const { data: mutualLike } = await supabase
        .from('secret_likes')
        .select('*')
        .eq('source_user_id', post.author_id)
        .eq('target_user_id', user.id)
        .single();

      if (mutualLike) {
        // Create match
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            user_a_id: user.id,
            user_b_id: post.author_id
          });

        if (!matchError) {
          toast({
            title: "It's a match! 🎉",
            description: "You can now chat privately. Check your matches tab!",
          });
        }
      }
    } catch (error) {
      console.error('Error sending secret like:', error);
      toast({
        title: "Error",
        description: "Failed to send secret like. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-40 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Inkling
          </h1>
          <Button 
            onClick={() => setShowComposer(true)}
            size="sm"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Post
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="foryou" className="flex items-center space-x-1">
              <Sparkles className="h-4 w-4" />
              <span>For You</span>
            </TabsTrigger>
            <TabsTrigger value="fresh" className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>Fresh</span>
            </TabsTrigger>
            <TabsTrigger value="campus" className="flex items-center space-x-1">
              <span>Campus</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feed Content */}
      <div className="p-4 space-y-4">
        <TabsContent value={activeTab} className="mt-0 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-32"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share something with your campus!
              </p>
              <Button 
                onClick={() => setShowComposer(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                Create First Post
              </Button>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  reactions: [],
                  comments_count: post.comment_count
                }}
                onLike={() => handleLike(post.id)}
                onComment={onPostClick}
                onSecretLike={() => handleSecretLike(post.id)}
              />
            ))
          )}
        </TabsContent>
      </div>

      {/* Post Composer Modal */}
      {showComposer && (
        <PostComposer
          onClose={() => setShowComposer(false)}
          onPostCreated={fetchPosts}
          section="feed"
        />
      )}
    </div>
  );
};