import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, Users, Clock, Sparkles, Shield, Timer, Shuffle } from 'lucide-react';
import { blindDateService } from '@/services/blindDateService';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [searchingTime, setSearchingTime] = useState(0);

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

  useEffect(() => {
    if (isSearching) {
      const interval = setInterval(() => {
        setSearchingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setSearchingTime(0);
    }
  }, [isSearching]);

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
        toast({
          title: "Looking for a match...",
          description: "We'll pair you with someone of the opposite gender.",
        });

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

        const timeout = setTimeout(() => {
          supabase.removeChannel(channel);
          setIsSearching(false);
          if (session) {
            blindDateService.endSession(session.id);
          }
          toast({
            title: "Search timeout",
            description: "No matches found. Try again later!",
          });
        }, 600000);

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

  const cancelSearch = async () => {
    setIsSearching(false);
    const session = await blindDateService.getActiveSession();
    if (session && session.user_a_id === session.user_b_id) {
      await blindDateService.endSession(session.id);
    }
  };

  if (currentSession && currentSession.status === 'active') {
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-3 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-md border-b border-pink-500/20 flex items-center justify-between sticky top-0 z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg relative">
              <Users className="h-5 w-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-none mb-1">Mystery Match 💫</h3>
              <div className="flex items-center gap-1.5">
                <Timer className="h-3 w-3 text-pink-500" />
                <p className="text-xs text-muted-foreground">Expires in <span className="font-semibold text-pink-500">{timeLeft}</span></p>
              </div>
            </div>
          </div>
          <Button onClick={endSession} variant="outline" size="sm" className="h-8 text-xs px-3 rounded-full border-pink-500/30 text-pink-500 hover:bg-pink-500/10">
            End Chat
          </Button>
        </motion.div>

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
    <div className="min-h-screen bg-background pb-24 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 text-center space-y-6 border-0 shadow-xl bg-gradient-to-br from-card via-card to-pink-500/5 overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -ml-16 -mb-16 blur-3xl" />
          
          <div className="relative z-10 space-y-6">
            {/* Icon */}
            <motion.div 
              animate={isSearching ? { rotate: 360 } : {}}
              transition={isSearching ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
              className="mx-auto w-24 h-24 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              {isSearching ? (
                <Shuffle className="h-10 w-10 text-white animate-pulse" />
              ) : (
                <Heart className="h-10 w-10 text-white fill-white/30" />
              )}
            </motion.div>
            
            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Blind Date
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Get matched with someone random for an <span className="text-pink-500 font-medium">anonymous 24-hour chat</span>. 
                No profiles, no names—just pure conversation.
              </p>
            </div>

            {/* Features */}
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 bg-secondary/80 px-3 py-1.5 rounded-full">
                <Eye className="h-3.5 w-3.5 text-pink-500" />
                <span>Anonymous</span>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary/80 px-3 py-1.5 rounded-full">
                <Shield className="h-3.5 w-3.5 text-purple-500" />
                <span>Safe</span>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary/80 px-3 py-1.5 rounded-full">
                <Timer className="h-3.5 w-3.5 text-indigo-500" />
                <span>24 hours</span>
              </div>
            </div>

            {/* Action */}
            <AnimatePresence mode="wait">
              {isSearching ? (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-2 h-2 bg-pink-500 rounded-full"
                          />
                        ))}
                      </div>
                      <span className="font-mono text-sm">{Math.floor(searchingTime / 60)}:{(searchingTime % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Looking for someone to chat with...
                    </p>
                  </div>
                  <Button 
                    onClick={cancelSearch}
                    variant="outline"
                    className="w-full border-pink-500/30 hover:bg-pink-500/10"
                  >
                    Cancel Search
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Button 
                    onClick={startBlindDate}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg shadow-pink-500/25"
                    size="lg"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Find Someone to Chat
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* How it works */}
            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="font-semibold text-sm">How it works</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2 bg-secondary/50 p-2.5 rounded-lg">
                  <span className="text-base">🎲</span>
                  <span>Random matching with opposite gender</span>
                </div>
                <div className="flex items-start gap-2 bg-secondary/50 p-2.5 rounded-lg">
                  <span className="text-base">👻</span>
                  <span>Completely anonymous chat</span>
                </div>
                <div className="flex items-start gap-2 bg-secondary/50 p-2.5 rounded-lg">
                  <span className="text-base">⏰</span>
                  <span>24 hours to connect</span>
                </div>
                <div className="flex items-start gap-2 bg-secondary/50 p-2.5 rounded-lg">
                  <span className="text-base">✨</span>
                  <span>Messages disappear after</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};