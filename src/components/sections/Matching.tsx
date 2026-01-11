import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, X, Sparkles, Users, ArrowLeft, ArrowRight } from 'lucide-react';
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
      if (currentIndex + 1 >= candidates.length) {
        // Load more candidates
        await loadCandidates();
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (error) {
      console.error('Error swiping:', error);
      toast({
        title: "Error",
        description: "Failed to record your choice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSwiping(false);
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
    <div className="min-h-screen bg-background pb-20 flex flex-col items-center p-4 pt-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center text-sm text-muted-foreground">
            Candidate {currentIndex + 1} of {candidates.length}
        </div>

        {/* Candidate Card */}
        <Card className="relative overflow-hidden h-[55vh] shadow-xl border-primary/10 rounded-3xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 transition-transform duration-500 group-hover:scale-105" />
          
          <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center">
             <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Users className="h-16 w-16 text-primary/40" />
             </div>
          </div>

          <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-background via-background/80 to-transparent">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    {currentCandidate.display_name || 'Anonymous'}
                </h3>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <p className="text-sm font-medium">
                    {currentCandidate.gender && `${currentCandidate.gender.charAt(0).toUpperCase() + currentCandidate.gender.slice(1)}`}
                    {currentCandidate.grad_year && ` • Class of ${currentCandidate.grad_year}`}
                  </p>
                </div>
              </div>
              
              {currentCandidate.bio && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {currentCandidate.bio}
                </p>
              )}
              
              {currentCandidate.interests && currentCandidate.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentCandidate.interests.slice(0, 3).map((interest, index) => (
                    <span
                      key={index}
                      className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8">
          <Button
            onClick={() => handleSwipe('pass')}
            disabled={swiping}
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-sm transition-all duration-300 hover:scale-110"
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
    </div>
  );
};