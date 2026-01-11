import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Sparkles, Users, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { matchingService, MatchCandidate } from '@/services/matchingService';
import { useToast } from '@/hooks/use-toast';

export const Matching = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

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

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (swiping || currentIndex >= candidates.length) return;
    
    setSwiping(true);
    const candidate = candidates[currentIndex];
    
    try {
      const isMatch = await matchingService.swipe(candidate.id, direction);
      
      if (isMatch && direction === 'like') {
        toast({
          title: "🎉 It's a Match!",
          description: `You and ${candidate.display_name || 'your match'} can now chat with each other!`,
          duration: 5000,
        });
      } else if (direction === 'like') {
        toast({
          title: "Like sent!",
          description: "If they like you back, you'll be matched!",
        });
      }
      
      // Move to next candidate
      setTimeout(() => {
        if (currentIndex + 1 >= candidates.length) {
            loadCandidates();
        } else {
            setCurrentIndex(prev => prev + 1);
        }
        setSwiping(false);
      }, 300);
      
    } catch (error) {
      console.error('Error swiping:', error);
      setSwiping(false);
      toast({
        title: "Error",
        description: "Failed to record your choice. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const currentCandidate = candidates[currentIndex];

  if (!currentCandidate) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center space-y-6 shadow-lg border-primary/10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-md">
              <Users className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">No More Matches</h2>
              <p className="text-muted-foreground">
                You've seen everyone available right now. Check back later for new people!
              </p>
            </div>

            <Button 
              onClick={loadCandidates}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="text-center py-2 text-sm text-muted-foreground">
        {candidates.length - currentIndex} people near you
      </div>
      
      <div className="flex-1 px-4 pb-4 flex items-center justify-center relative">
        <div className={`w-full max-w-md h-full transition-all duration-300 ${swiping ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
            <Card className="relative overflow-hidden h-full shadow-xl border-primary/10 rounded-3xl group bg-card">
              {/* Avatar Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentCandidate.avatar_color || 'from-primary/20 to-accent/20'} opacity-30 transition-transform duration-500 group-hover:scale-105`} />
              
              {/* Content Container */}
              <div className="relative h-full flex flex-col p-6 z-10 overflow-y-auto hide-scrollbar">
                
                {/* Header Profile Section */}
                <div className="flex flex-col items-center mb-6 mt-4">
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentCandidate.avatar_color || 'from-primary to-accent'} shadow-lg flex items-center justify-center mb-4 ring-4 ring-background animate-fade-in`}>
                    <Sparkles className="h-16 w-16 text-white/90" />
                  </div>
                  
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-2xl font-bold">{currentCandidate.display_name}</h2>
                        {currentCandidate.verification_status === 'verified' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-1.5 py-0 h-6">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Verified
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

                {/* Bio Section */}
                <div className="space-y-6 flex-1">
                    <div className="bg-background/60 backdrop-blur-sm p-4 rounded-xl border border-border/50 shadow-sm">
                        <p className="text-center text-lg leading-relaxed font-medium text-foreground/90">
                            "{currentCandidate.bio}"
                        </p>
                    </div>

                    {/* Interests Tags */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {currentCandidate.interests?.map((interest, i) => (
                        <Badge 
                            key={i} 
                            variant="outline" 
                            className="px-3 py-1.5 text-sm bg-background/50 backdrop-blur-sm border-primary/20"
                        >
                            {interest}
                        </Badge>
                        ))}
                    </div>

                    {/* Prompts Section (New) */}
                    {currentCandidate.prompts?.map((prompt, i) => (
                        <div key={i} className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-2">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider">{prompt.question}</p>
                            <p className="text-base font-medium">{prompt.answer}</p>
                        </div>
                    ))}
                </div>

              </div>
            </Card>
        </div>

        {/* Swipe Indicators */}
        <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-destructive/90 text-destructive-foreground p-4 rounded-full shadow-lg transform -rotate-12">
                <X className="h-8 w-8" />
            </div>
        </div>
        <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-green-500/90 text-white p-4 rounded-full shadow-lg transform rotate-12">
                <Heart className="h-8 w-8 fill-current" />
            </div>
        </div>
      </div>

      <div className="h-24 px-4 pb-4 flex items-center justify-center gap-6">
        <Button
          onClick={() => handleSwipe('pass')}
          disabled={swiping}
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full border-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive hover:scale-110 transition-all duration-300 shadow-lg shadow-destructive/10"
        >
          <X className="h-8 w-8" />
        </Button>
        
        <Button
          onClick={() => handleSwipe('like')}
          disabled={swiping}
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-110"
        >
          <Heart className="h-8 w-8 fill-current" />
        </Button>
      </div>
    </div>
  );
};