import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Sparkles, Users, CheckCircle2, Star, RotateCcw, Zap } from 'lucide-react';
import { matchingService, MatchCandidate } from '@/services/matchingService';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

export const Matching = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  useEffect(() => {
    loadCandidates();
  }, [user]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const newCandidates = await matchingService.getCandidates();
      setCandidates(newCandidates);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast({
        title: "Error",
        description: "Failed to load potential matches.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'like' | 'pass' | 'super_like') => {
    if (swiping || currentIndex >= candidates.length) return;
    
    setSwiping(direction === 'pass' ? 'left' : 'right');
    const candidate = candidates[currentIndex];
    const actualDirection = direction === 'super_like' ? 'like' : direction;
    
    try {
      const isMatch = await matchingService.swipe(candidate.id, actualDirection);
      
      if (direction === 'super_like') {
        toast({
          title: "🌟 Super Like sent!",
          description: `You really like ${candidate.display_name}!`,
          className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none"
        });
      } else if (isMatch && direction === 'like') {
        toast({
          title: "🎉 It's a Match!",
          description: `You and ${candidate.display_name || 'your match'} can now chat!`,
          duration: 5000,
        });
      } else if (direction === 'like') {
        toast({
          title: "💕 Like sent!",
          description: "If they like you back, you'll be matched!",
        });
      }
      
      setTimeout(() => {
        if (currentIndex + 1 >= candidates.length) {
          loadCandidates();
        } else {
          setCurrentIndex(prev => prev + 1);
        }
        setSwiping(null);
        x.set(0);
      }, 300);
      
    } catch (error) {
      console.error('Error swiping:', error);
      setSwiping(null);
      toast({
        title: "Error",
        description: "Failed to record your choice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      handleSwipe('like');
    } else if (info.offset.x < -100) {
      handleSwipe('pass');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Heart className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  const currentCandidate = candidates[currentIndex];

  if (!currentCandidate) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center space-y-6 border-0 shadow-xl">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg"
            >
              <Users className="h-10 w-10 text-white" />
            </motion.div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">You've seen everyone!</h2>
              <p className="text-muted-foreground">
                Check back later for new people to match with.
              </p>
            </div>

            <Button 
              onClick={loadCandidates}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] pb-4 overflow-hidden">
      {/* Stats bar */}
      <div className="text-center py-2 flex items-center justify-center gap-3">
        <Badge variant="outline" className="gap-1.5 text-xs">
          <Sparkles className="h-3 w-3 text-primary" />
          {candidates.length - currentIndex} nearby
        </Badge>
        <Badge variant="outline" className="gap-1.5 bg-orange-500/10 border-orange-500/30 text-xs">
          <Zap className="h-3 w-3 text-orange-500 fill-current" />
          3 boosts left
        </Badge>
      </div>
      
      {/* Card Stack */}
      <div className="flex-1 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Background cards for stack effect */}
        {candidates.slice(currentIndex + 1, currentIndex + 3).map((_, i) => (
          <div
            key={`bg-${i}`}
            className="absolute inset-x-6 max-w-sm mx-auto"
            style={{
              height: 'calc(100% - 1rem)',
              transform: `translateY(${(i + 1) * 6}px) scale(${1 - (i + 1) * 0.04})`,
              opacity: 1 - (i + 1) * 0.25,
              zIndex: -i - 1
            }}
          >
            <Card className="h-full bg-card/50 rounded-2xl" />
          </div>
        ))}

        {/* Main card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCandidate.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ 
              scale: swiping ? 0.9 : 1, 
              opacity: swiping ? 0 : 1,
              x: swiping === 'left' ? -300 : swiping === 'right' ? 300 : 0,
              rotate: swiping === 'left' ? -20 : swiping === 'right' ? 20 : 0
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full max-w-sm h-[calc(100%-0.5rem)] cursor-grab active:cursor-grabbing"
          >
            <Card className="relative overflow-hidden h-full shadow-2xl border-0 rounded-2xl group bg-card">
              {/* Swipe indicators */}
              <motion.div 
                style={{ opacity: likeOpacity }}
                className="absolute top-4 left-4 z-20 bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold text-base rotate-[-20deg] border-2 border-green-400"
              >
                LIKE 💚
              </motion.div>
              <motion.div 
                style={{ opacity: nopeOpacity }}
                className="absolute top-4 right-4 z-20 bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-base rotate-[20deg] border-2 border-red-400"
              >
                NOPE ❌
              </motion.div>
              
              {/* Avatar Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentCandidate.avatar_color || 'from-primary/30 to-accent/30'} opacity-50`} />
              
              {/* Content */}
              <div className="relative h-full flex flex-col p-4 z-10 overflow-y-auto hide-scrollbar">
                
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-4 mt-2">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentCandidate.avatar_color || 'from-primary to-accent'} shadow-xl flex items-center justify-center mb-3 ring-4 ring-background`}
                  >
                    <Sparkles className="h-10 w-10 text-white/90" />
                  </motion.div>
                  
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-2xl font-bold">{currentCandidate.display_name}</h2>
                      {currentCandidate.verification_status === 'verified' && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-1.5 py-0 h-6">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                      <span className="capitalize">{currentCandidate.gender}</span>
                      <span>•</span>
                      <span>Class of {currentCandidate.grad_year}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-4 flex-1">
                  <div className="bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-border/50">
                    <p className="text-center text-base leading-relaxed font-medium">
                      "{currentCandidate.bio}"
                    </p>
                  </div>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {currentCandidate.interests?.map((interest, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary"
                        className="px-3 py-1.5 text-sm bg-background/60 backdrop-blur-sm"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>

                  {/* Prompts */}
                  {currentCandidate.prompts?.map((prompt, i) => (
                    <div key={i} className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{prompt.question}</p>
                      <p className="text-sm font-medium">{prompt.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="h-16 px-4 flex items-center justify-center gap-5 mt-2">
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            onClick={() => handleSwipe('pass')}
            disabled={!!swiping}
            size="lg"
            variant="outline"
            className="w-14 h-14 rounded-full border-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive shadow-lg"
          >
            <X className="h-7 w-7" />
          </Button>
        </motion.div>
        
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            onClick={() => handleSwipe('super_like')}
            disabled={!!swiping}
            size="lg"
            className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg -mt-2"
          >
            <Star className="h-5 w-5 fill-current" />
          </Button>
        </motion.div>
        
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            onClick={() => handleSwipe('like')}
            disabled={!!swiping}
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
          >
            <Heart className="h-7 w-7 fill-current" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};