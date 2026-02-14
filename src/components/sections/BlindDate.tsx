import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Heart, MessageCircle, Users, Clock } from 'lucide-react';
import { blindDateService } from '@/services/blindDateService';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useToast } from '@/hooks/use-toast';

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
      if (session) {
        setCurrentSession({
          ...session,
          status: 'active',
          expires_at: session.active_until
        });
        toast({
          title: "Match found!",
          description: "You've been paired with someone. Chat expires in 24 hours.",
        });
      } else {
        toast({
          title: "Searching...",
          description: "Looking for someone to chat with. Please wait.",
        });
        // Poll for match every 5 seconds
        const pollInterval = setInterval(async () => {
          const newSession = await blindDateService.getActiveSession();
          if (newSession) {
            setCurrentSession({
              ...newSession,
              status: 'active',
              expires_at: newSession.active_until
            });
            setIsSearching(false);
            clearInterval(pollInterval);
            toast({
              title: "Match found!",
              description: "You've been paired with someone. Chat expires in 24 hours.",
            });
          }
        }, 5000);

        // Stop searching after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setIsSearching(false);
          toast({
            title: "No matches",
            description: "No one available right now. Try again later!",
          });
        }, 120000);
      }
    } catch (error) {
      console.error('Error starting blind date:', error);
      toast({
        title: "Error",
        description: "Failed to start blind date. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (!currentSession) {
        setIsSearching(false);
      }
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
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Blind Date</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{timeLeft}</span>
              <Button onClick={endSession} variant="outline" size="sm">
                End Chat
              </Button>
            </div>
          </div>
        </div>

        <ChatWindow 
          type="blind_date" 
          sessionId={currentSession.id}
          onSessionEnd={() => setCurrentSession(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center space-x-2 p-4">
          <Eye className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Blind Date</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 pt-12">
        <Card className="p-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-primary-foreground" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Ready for a Blind Date?</h2>
            <p className="text-muted-foreground">
              Get matched with someone random for an anonymous 24-hour chat. 
              No profiles, no names—just pure conversation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Anonymous • Safe • Ephemeral</span>
            </div>

            {isSearching ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">
                  Searching for someone to chat with...
                </p>
                <Button 
                  onClick={() => setIsSearching(false)} 
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