import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Heart, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { matchingService, Match, MatchCandidate } from '@/services/matchingService';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const Chatting = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [likesReceived, setLikesReceived] = useState<MatchCandidate[]>([]);
  const [likesSent, setLikesSent] = useState<MatchCandidate[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMatches();
      loadLikes();
    }

    const channel = supabase
      .channel('matches-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, async (payload) => {
        const newRow: any = payload.new;
        
        // Refresh lists immediately
        await Promise.all([loadMatches(), loadLikes()]);

        if (user && newRow.user_b_id === user.id) {
          // Check if this creates a mutual match
          const { data: reverseMatch } = await supabase
            .from('matches')
            .select('*')
            .eq('user_a_id', user.id)
            .eq('user_b_id', newRow.user_a_id)
            .maybeSingle();

          if (reverseMatch) {
            // Mutual match - show celebration
            toast({
              title: "🎉 It's a Match!",
              description: "You can now chat with each other.",
            });
          } else {
            // One-way like
            toast({
              title: "New like!",
              description: "Someone liked you. Like back to start chatting.",
            });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const userMatches = await matchingService.getMatches();
      setMatches(userMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast({
        title: "Error",
        description: "Failed to load your matches.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLikes = async () => {
    try {
      const [received, sent] = await Promise.all([
        matchingService.getLikesReceived(),
        matchingService.getLikesSent(),
      ]);
      setLikesReceived(received);
      setLikesSent(sent);
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (selectedMatch) {
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col">
         {/* Chat Header */}
         <div className="p-3 bg-card/80 backdrop-blur-md border-b border-border flex items-center gap-3 sticky top-0 z-10">
             <Button
              onClick={() => setSelectedMatch(null)}
              variant="ghost"
              size="icon"
              className="h-9 w-9 -ml-1 hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
                 <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-sm">
                    <Heart className="h-4 w-4 text-primary-foreground fill-current" />
                 </div>
                 <div>
                     <h3 className="font-semibold text-sm leading-none mb-1">Anonymous Match</h3>
                     <p className="text-xs text-muted-foreground">Chatting anonymously</p>
                 </div>
            </div>
         </div>

        <div className="flex-1">
            <ChatWindow 
            type="match" 
            sessionId={selectedMatch.id}
            onSessionEnd={() => setSelectedMatch(null)}
            />
        </div>
      </div>
    );
  }

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
      <div className="max-w-md mx-auto p-4">
        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="mt-4">
            {matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-10 w-10 text-primary/60" />
                </div>
                <h2 className="text-xl font-bold mb-3">No Matches Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start matching with people to begin chatting anonymously!
                </p>
                <Button className="bg-gradient-to-r from-primary to-primary/80">
                  <Heart className="h-4 w-4 mr-2" />
                  Start Matching
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Your Matches</h2>
                  <p className="text-sm text-muted-foreground">
                    {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                  </p>
                </div>

                {matches.map((match) => (
                  <Card
                    key={match.id}
                    className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                          <Heart className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Anonymous Match</h3>
                          <p className="text-sm text-muted-foreground">
                            Matched {formatTimeAgo(match.created_at)}
                          </p>
                          {match.match_type === 'swipe_match' && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              Mutual Like
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {match.unread_count > 0 && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-primary-foreground font-bold">
                              {match.unread_count > 9 ? '9+' : match.unread_count}
                            </span>
                          </div>
                        )}
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    
                    {match.last_message && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {typeof match.last_message === 'string' 
                            ? match.last_message 
                            : 'Start your conversation...'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(match.created_at)}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="likes" className="mt-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Likes You</h3>
              {likesReceived.length === 0 ? (
                <p className="text-sm text-muted-foreground">No one has liked you yet. Keep exploring!</p>
              ) : (
                <div className="space-y-2">
                  {likesReceived.map((u) => (
                    <Card key={u.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{u.display_name || 'Anonymous'}</p>
                          <p className="text-sm text-muted-foreground">Liked you — like back to match</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              const isMutual = await matchingService.likeUser(u.id);
                              
                              // Refresh both lists
                              await Promise.all([loadMatches(), loadLikes()]);
                              
                              if (isMutual) {
                                toast({
                                  title: "🎉 It's a Match!",
                                  description: "You can now start chatting.",
                                });
                              } else {
                                toast({
                                  title: "Like sent!",
                                  description: "You'll match when they like you back.",
                                });
                              }
                            } catch (error) {
                              console.error('Error liking back:', error);
                              toast({
                                title: "Error",
                                description: "Failed to like back. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Like Back
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Your Likes</h3>
              {likesSent.length === 0 ? (
                <p className="text-sm text-muted-foreground">You haven't liked anyone yet.</p>
              ) : (
                <div className="space-y-2">
                  {likesSent.map((u) => (
                    <Card key={u.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{u.display_name || 'Anonymous'}</p>
                          <p className="text-sm text-muted-foreground">Waiting for a like back</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};