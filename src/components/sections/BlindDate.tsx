import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Heart, MessageCircle, Users, Clock } from 'lucide-react';
import { blindDateService } from '@/services/blindDateService';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface BlindDateSession {
  id: string;
  status: 'active' | 'ended' | 'expired';
  expires_at: string;
  created_at: string;
  active_until: string;
  user_a_id: string | null;
  user_b_id: string | null;
}

export const BlindDate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [currentSession, setCurrentSession] = useState<BlindDateSession | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    checkActiveSession();
  }, [user]);

  useEffect(() => {
    if (currentSession && currentSession.status === 'active') {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(currentSession.expires_at).getTime();
        const diff = expiry - now;

        if (diff <= 0) {
          setTimeLeft('Expired');
          setCurrentSession(null);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentSession]);

  const checkActiveSession = async () => {
    try {
      const session = await blindDateService.getActiveSession();
      if (session) {
        setCurrentSession({
          ...session,
          status: 'active',
          expires_at: session.active_until
        });
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const startBlindDate = async () => {
    setIsSearching(true);
    try {
      const session = await blindDateService.findMatch();
      
      if (session && session.user_a_id !== session.user_b_id) {
        // Immediate match found
        setCurrentSession({
          ...session,
          status: 'active',
          expires_at: session.active_until
        });
        setIsSearching(false);
        toast({
          title: "🎉 Match found!",
          description: "You've been paired with someone. Chat expires in 24 hours.",
        });
      } else if (session) {
        // Waiting for a match - set up real-time subscription
        toast({
          title: "Searching...",
          description: "Waiting for someone of opposite gender to join...",
        });

        // Subscribe to changes in the blind_dates table for this session
        const channel = supabase
          .channel(`blind-date-${session.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'blind_dates',
              filter: `id=eq.${session.id}`
            },
            (payload) => {
              const updatedSession = payload.new as any;
              // Check if a match was made (user_b_id changed from user_a_id)
              if (updatedSession.user_b_id !== updatedSession.user_a_id) {
                setCurrentSession({
                  ...updatedSession,
                  status: 'active',
                  expires_at: updatedSession.active_until
                });
                setIsSearching(false);
                supabase.removeChannel(channel);
                toast({
                  title: "🎉 Match found!",
                  description: "You've been paired with someone. Chat expires in 24 hours.",
                });
              }
            }
          )
          .subscribe();

        // Clean up subscription if user cancels or timeout
        const timeout = setTimeout(() => {
          supabase.removeChannel(channel);
          setIsSearching(false);
          // End the session if no match found
          if (session) {
            blindDateService.endSession(session.id);
          }
          toast({
            title: "Search timeout",
            description: "No matches found. Try again later!",
          });
        }, 600000); // 10 minutes

        // Store cleanup function
        return () => {
          clearTimeout(timeout);
          supabase.removeChannel(channel);
        };
      }
    } catch (error: any) {
      console.error('Error starting blind date:', error);
      setIsSearching(false);
      toast({
        title: "Error",
        description: error?.message || "Failed to start blind date. Please check your gender is set in profile.",
        variant: "destructive",
      });
    }
  };

  const endSession = async () => {
    if (currentSession) {
      try {
        await blindDateService.endSession(currentSession.id);
        setCurrentSession(null);
        toast({
          title: "Session ended",
          description: "Your blind date chat has ended.",
        });
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
  };

  if (currentSession && currentSession.status === 'active') {
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col">
        {/* Active Session Header */}
        <div className="p-4 bg-card/50 backdrop-blur-sm border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="font-medium">Anonymous Chat</span>
            </div>
            <Button onClick={endSession} variant="destructive" size="sm" className="h-8">
              End Chat
            </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatWindow 
            type="blind_date" 
            sessionId={currentSession.id}
            expiresAt={currentSession.expires_at}
            onSessionEnd={() => setCurrentSession(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center space-y-6 shadow-lg border-primary/10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-md">
            <Heart className="h-10 w-10 text-primary-foreground" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Blind Date</h2>
            <p className="text-muted-foreground">
              Get matched with someone random for an anonymous 24-hour chat. 
              No profiles, no names—just pure conversation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-secondary/50 py-2 rounded-full">
              <Users className="h-4 w-4" />
              <span>Anonymous • Safe • Ephemeral</span>
            </div>

            {isSearching ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">
                  Waiting for someone of opposite gender...
                </p>
                <Button 
                  onClick={async () => {
                    setIsSearching(false);
                    const session = await blindDateService.getActiveSession();
                    if (session && session.user_a_id === session.user_b_id) {
                      await blindDateService.endSession(session.id);
                    }
                  }} 
                  variant="outline"
                  className="w-full"
                >
                  Cancel Search
                </Button>
              </div>
            ) : (
              <Button 
                onClick={startBlindDate}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Find Someone to Chat
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <h3 className="font-semibold text-sm">How it works:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Get matched randomly with another user</li>
              <li>• Chat anonymously for up to 24 hours</li>
              <li>• No way to know who you're talking to</li>
              <li>• Chat disappears when time expires</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};