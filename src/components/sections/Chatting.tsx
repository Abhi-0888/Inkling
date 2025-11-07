import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Heart, Users, ArrowRight } from 'lucide-react';
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, (payload) => {
        // Refresh lists on any relevant insert
        loadMatches();
        loadLikes();

        const newRow: any = payload.new;
        if (user && newRow.user_b_id === user.id) {
          // Notification to receiver
          toast({
            title: "New like!",
            description: "Someone liked you. Like back to start chatting.",
          });
        }

        // If mutual, show celebratory toast
        if (user && ((newRow.user_a_id === user.id) || (newRow.user_b_id === user.id))) {
          // We rely on loadMatches detecting mutual pairs and showing them
          // Optionally, we could check immediately, but keeping it lightweight
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
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center space-x-2 p-4">
            <Button
              onClick={() => setSelectedMatch(null)}
              variant="ghost"
              size="sm"
            >
              ← Back
            </Button>
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Anonymous Chat</h1>
          </div>
        </div>

        <ChatWindow 
          type="match" 
          sessionId={selectedMatch.id}
          onSessionEnd={() => setSelectedMatch(null)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center space-x-2 p-4">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Chatting</h1>
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
        <div className="flex items-center space-x-2 p-4">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Chatting</h1>
        </div>
      </div>

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
                              await matchingService.likeUser(u.id);
                              await loadMatches();
                              await loadLikes();
                              toast({
                                title: "It's a match!",
                                description: "You can now chat with each other.",
                              });
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