import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';
import { CommentsDialog } from '@/components/feed/CommentsDialog';
import { Button } from '@/components/ui/button';
import { Plus, Flame } from 'lucide-react';
import { postService, PostWithStats } from '@/services/postService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VerificationGate } from '@/components/common/VerificationGate';

interface DarkDesireProps {
  onShowProfile: () => void;
}

export const DarkDesire = ({ onShowProfile }: DarkDesireProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('darkdesire-changes')
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
  }, [userProfile]);

  const fetchPosts = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    try {
      const fetchedPosts = await postService.getDarkDesirePosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching dark desire posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setShowComposer(false);
    fetchPosts();
    toast({
      title: "Confession posted",
      description: "Your anonymous confession is now live.",
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <Flame className="h-6 w-6 text-destructive" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
                Dark Desire
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-destructive" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
              Dark Desire
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowComposer(true)}
              size="sm"
              className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70"
            >
              <Plus className="h-4 w-4 mr-1" />
              Confess
            </Button>
            <Button 
              onClick={onShowProfile}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Profile
            </Button>
          </div>
        </div>
        
        <div className="px-4 pb-3">
          <p className="text-sm text-muted-foreground">
            Anonymous confessions and deeper thoughts. Share your secrets safely.
          </p>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-2xl mx-auto">
        <VerificationGate requireVerification={true} onShowProfile={onShowProfile}>
          {posts.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Flame className="h-12 w-12 text-destructive/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No confessions yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share an anonymous confession
              </p>
              <Button 
                onClick={() => setShowComposer(true)}
                className="bg-gradient-to-r from-destructive to-destructive/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Share a Secret
              </Button>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onComment={(postId) => setSelectedPostId(postId)}
              />
              ))}
            </div>
          )}
        </VerificationGate>
      </div>

      {/* Post Composer Modal */}
      {showComposer && (
        <PostComposer
          onClose={() => setShowComposer(false)}
          onPostCreated={handlePostCreated}
          section="dark_desire"
          placeholder="Share your deepest thoughts anonymously..."
          title="Anonymous Confession"
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