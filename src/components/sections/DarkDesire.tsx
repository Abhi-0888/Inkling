import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';
import { CommentsDialog } from '@/components/feed/CommentsDialog';
import { Button } from '@/components/ui/button';
import { Plus, Flame, TrendingUp } from 'lucide-react';
import { postService, PostWithStats } from '@/services/postService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VerificationGate } from '@/components/common/VerificationGate';
import { DailyPoll } from '@/components/feed/DailyPoll';

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

  const VIBES = [
    { icon: "😴", label: "Tired" },
    { icon: "🥳", label: "Party" },
    { icon: "💔", label: "Sad" },
    { icon: "👻", label: "Ghost" },
    { icon: "📚", label: "Study" },
    { icon: "🤔", label: "Deep" },
    { icon: "👀", label: "Looking" },
  ];

  const [myVibe, setMyVibe] = useState<string | null>(localStorage.getItem('my_daily_vibe'));

  const handleSetVibe = (vibe: string) => {
    setMyVibe(vibe);
    localStorage.setItem('my_daily_vibe', vibe);
    toast({
        title: `Vibe set: ${vibe}`,
        description: "Your vibe has been updated for today.",
    });
  };

  const TRENDING_TOPICS = [
    { tag: "#CampusCrush", count: "2.4k" },
    { tag: "#ExamStress", count: "1.8k" },
    { tag: "#Confession", count: "5.2k" },
    { tag: "#MissedConnection", count: "900" },
    { tag: "#NightThoughts", count: "1.2k" },
  ];

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
      {/* Daily Vibe Selector */}
      <div className="pt-4 px-4 pb-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">What's your vibe today?</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {VIBES.map((v) => (
                <button 
                    key={v.label}
                    onClick={() => handleSetVibe(v.label)}
                    className={`flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-xl transition-all ${myVibe === v.label ? 'bg-primary/10 scale-105 ring-2 ring-primary/20' : 'hover:bg-muted/50 grayscale hover:grayscale-0'}`}
                >
                    <span className="text-2xl filter drop-shadow-sm">{v.icon}</span>
                    <span className="text-[10px] font-medium">{v.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Trending Topics Rail */}
      <div className="px-4 py-2">
         <div className="flex items-center gap-2 mb-2">
             <TrendingUp className="h-3 w-3 text-primary" />
             <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Trending Now</span>
         </div>
         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
             {TRENDING_TOPICS.map((topic, i) => (
                 <div key={i} className="flex-shrink-0 bg-secondary/50 hover:bg-secondary border border-border/50 rounded-full px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors">
                     <span className="text-xs font-semibold text-foreground">{topic.tag}</span>
                     <span className="text-[10px] text-muted-foreground">{topic.count}</span>
                 </div>
             ))}
         </div>
      </div>

      {/* Intro & Action */}
      <div className="px-4 py-2 space-y-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => setShowComposer(true)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-colors"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                            <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
                        </div>
                        <h2 className="font-bold text-lg">Dark Desire</h2>
                    </div>
                </div>
                <p className="text-sm text-gray-300 mb-4 max-w-[80%]">
                    Share your deepest secrets anonymously. No judgment, just relief.
                </p>
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-white/90 font-semibold w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Confess a Secret
                </Button>
            </div>
          </div>
          
          <DailyPoll />
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