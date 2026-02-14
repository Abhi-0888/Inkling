import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Sparkles, TrendingUp } from 'lucide-react';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { CommentsDialog } from './CommentsDialog';
import { SkeletonFeed } from '@/components/ui/skeleton-card';
import { postService, PostWithStats } from '@/services/postService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VerificationGate } from '@/components/common/VerificationGate';

interface FeedProps {
  onPostClick?: (postId: string) => void;
  onShowProfile: () => void;
}

export const Feed = ({ onPostClick, onShowProfile }: FeedProps) => {
  const [posts, setPosts] = useState<PostWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('foryou');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    
    // Set up real-time subscriptions for posts, reactions, and comments
    const channel = supabase
      .channel('feed-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => {
        fetchPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      {/* Tabs Section */}
      <div className="sticky top-14 bg-background/95 backdrop-blur-md border-b border-border z-30 px-4 pt-3">
        <div className="flex items-center justify-between mb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3 h-10">
              <TabsTrigger value="foryou" className="flex items-center gap-1.5 text-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>For You</span>
              </TabsTrigger>
              <TabsTrigger value="fresh" className="flex items-center gap-1.5 text-sm">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Fresh</span>
              </TabsTrigger>
              <TabsTrigger value="campus" className="text-sm">
                Campus
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            onClick={() => setShowComposer(true)}
            size="sm"
            className="ml-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md"
          >
            <Plus className="h-4 w-4 mr-1" />
            Post
          </Button>
        </div>
      </div>

      {/* Feed Content */}
      <div className="p-4 space-y-4">
        <VerificationGate requireVerification={true} onShowProfile={onShowProfile}>
          {loading ? (
            <SkeletonFeed count={3} />
          ) : posts.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
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
            posts.map((post, index) => (
              <div 
                key={post.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostCard
                  post={post}
                  onLike={() => handleLike(post.id)}
                  onComment={(postId) => setSelectedPostId(postId)}
                  onSecretLike={() => handleSecretLike(post.id)}
                />
              </div>
            ))
          )}
        </VerificationGate>
      </div>

      {/* Post Composer Modal */}
      {showComposer && (
        <PostComposer
          onClose={() => setShowComposer(false)}
          onPostCreated={fetchPosts}
          section="feed"
        />
      )}

      {/* Comments Dialog */}
      {selectedPostId && (
        <CommentsDialog
          postId={selectedPostId}
          isOpen={!!selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
};