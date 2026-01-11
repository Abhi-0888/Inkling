import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Heart, Users, ArrowRight, ArrowLeft, Search, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { matchingService, Match, MatchCandidate } from '@/services/matchingService';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export const Chatting = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [likesReceived, setLikesReceived] = useState<MatchCandidate[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadMatches();
      loadLikes();
    }

    const channel = supabase
      .channel('matches-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, async (payload) => {
        const newRow: any = payload.new;
        await Promise.all([loadMatches(), loadLikes()]);

        if (user && newRow.user_b_id === user.id) {
           const { data: reverseMatch } = await supabase
            .from('matches')
            .select('*')
            .eq('user_a_id', user.id)
            .eq('user_b_id', newRow.user_a_id)
            .maybeSingle();

          if (reverseMatch) {
            toast({
              title: "🎉 It's a Match!",
              description: "You can now chat with each other.",
            });
          } else {
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
    } finally {
      setLoading(false);
    }
  };

  const loadLikes = async () => {
    try {
      const received = await matchingService.getLikesReceived();
      setLikesReceived(received);
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

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  const filteredMatches = matches.filter(m => 
    m.other_user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedMatch) {
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col">
         {/* Chat Header */}
         <div className="p-3 bg-card/80 backdrop-blur-md border-b border-border flex items-center gap-3 sticky top-0 z-10 shadow-sm">
             <Button
              onClick={() => setSelectedMatch(null)}
              variant="ghost"
              size="icon"
              className="h-9 w-9 -ml-1 hover:bg-primary/10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
                 <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedMatch.other_user?.avatar_color || 'from-primary to-accent'} flex items-center justify-center shadow-sm relative`}>
                    <Users className="h-5 w-5 text-white" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                 </div>
                 <div>
                     <h3 className="font-semibold text-sm leading-none mb-1">{selectedMatch.other_user?.display_name || 'Anonymous'}</h3>
                     <p className="text-xs text-muted-foreground">Active now</p>
                 </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </Button>
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

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Messages</h1>
            <div className="bg-primary/10 p-2 rounded-full">
                <MessageCircle className="h-5 w-5 text-primary" />
            </div>
        </div>

        {/* Search */}
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search matches..." 
                className="pl-9 bg-muted/50 border-none rounded-2xl h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      {/* New Matches Scroll */}
      {likesReceived.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">New Likes</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">{likesReceived.length}</Badge>
            </div>
            <ScrollArea className="w-full whitespace-nowrap pb-4">
                <div className="flex w-max space-x-4">
                    {likesReceived.map((user) => (
                        <div key={user.id} className="flex flex-col items-center space-y-2 cursor-pointer group"
                            onClick={async () => {
                                try {
                                    const isMutual = await matchingService.likeUser(user.id);
                                    await Promise.all([loadMatches(), loadLikes()]);
                                    if (isMutual) {
                                        toast({ title: "It's a Match! 🎉", description: "You can now chat!" });
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                            }}
                        >
                            <div className="relative">
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${user.avatar_color || 'from-pink-500 to-rose-500'} p-0.5 shadow-md group-hover:scale-105 transition-transform`}>
                                    <div className="w-full h-full rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                                        <Heart className="h-6 w-6 text-white fill-white/20" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                                    <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <span className="text-xs font-medium w-16 text-center truncate">{user.display_name}</span>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
          </div>
      )}

      {/* Messages List */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Chats</h3>
        
        {loading ? (
             <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : filteredMatches.length === 0 ? (
            <div className="text-center py-10 opacity-60">
                <p>No matches found.</p>
            </div>
        ) : (
            <div className="space-y-1">
                {filteredMatches.map((match) => (
                    <div 
                        key={match.id} 
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer active:scale-98 duration-200"
                        onClick={() => setSelectedMatch(match)}
                    >
                        <div className="relative">
                            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${match.other_user?.avatar_color || 'from-blue-500 to-cyan-500'} flex items-center justify-center text-white shadow-sm`}>
                                <Users className="h-6 w-6" />
                            </div>
                            {match.unread_count > 0 && (
                                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-background">
                                    {match.unread_count}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-base truncate">{match.other_user?.display_name || 'Anonymous'}</h4>
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{formatTimeAgo(match.created_at)}</span>
                            </div>
                            <p className={`text-sm truncate ${match.unread_count > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                {match.last_message || 'Start a conversation...'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
};