import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Check, Loader2 } from 'lucide-react';
import { getFeaturedPoll, votePoll, CampusPoll } from '@/services/pollService';
import { toast } from 'sonner';

// Fallback questions for when no database poll exists
const FALLBACK_POLLS = [
  {
    question: "Pineapple on pizza?",
    optionA: "Yes, it's elite 🍍",
    optionB: "No, that's a crime 🚫",
    color: "from-yellow-500 to-orange-500"
  },
  {
    question: "First date: Coffee or Drinks?",
    optionA: "Coffee ☕",
    optionB: "Drinks 🍸",
    color: "from-blue-500 to-indigo-500"
  },
  {
    question: "Is it okay to ghost?",
    optionA: "Sometimes necessary 👻",
    optionB: "Never, be mature 🚩",
    color: "from-purple-500 to-pink-500"
  },
  {
    question: "Money or Love?",
    optionA: "Secure the bag 💰",
    optionB: "True Love ❤️",
    color: "from-green-500 to-emerald-500"
  }
];

export const DailyPoll = () => {
  const [dbPoll, setDbPoll] = useState<CampusPoll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  // Fallback poll based on day
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const fallbackPoll = FALLBACK_POLLS[dayOfYear % FALLBACK_POLLS.length];
  
  const [localVote, setLocalVote] = useState<'A' | 'B' | null>(null);
  const [localStats, setLocalStats] = useState({ a: 45, b: 55 });

  useEffect(() => {
    loadPoll();
    // Load local vote for fallback
    const savedVote = localStorage.getItem(`poll_vote_${dayOfYear}`);
    if (savedVote) {
      setLocalVote(savedVote as 'A' | 'B');
      setLocalStats({
        a: 40 + (dayOfYear % 20),
        b: 100 - (40 + (dayOfYear % 20))
      });
    }
  }, [dayOfYear]);

  const loadPoll = async () => {
    setLoading(true);
    try {
      const poll = await getFeaturedPoll();
      setDbPoll(poll);
    } catch (error) {
      console.error('Error loading poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDbVote = async (optionIndex: number) => {
    if (!dbPoll || voting) return;
    setVoting(true);
    const success = await votePoll(dbPoll.id, optionIndex);
    if (success) {
      toast.success('Vote recorded!');
      loadPoll();
    } else {
      toast.error('Failed to vote');
    }
    setVoting(false);
  };

  const handleLocalVote = (option: 'A' | 'B') => {
    setLocalVote(option);
    localStorage.setItem(`poll_vote_${dayOfYear}`, option);
    setLocalStats(prev => ({
      a: option === 'A' ? Math.min(prev.a + 2, 65) : Math.max(prev.a - 1, 35),
      b: option === 'B' ? Math.min(prev.b + 2, 65) : Math.max(prev.b - 1, 35)
    }));
    toast.success('Vote recorded!');
  };

  if (loading) {
    return (
      <Card className="p-5 relative overflow-hidden border-none shadow-md">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  // Use database poll if available
  if (dbPoll) {
    const hasVoted = dbPoll.user_vote !== null;
    const totalVotes = dbPoll.total_votes || 0;

    return (
      <Card className="p-5 relative overflow-hidden border-none shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Daily Hot Take</h3>
          </div>
          
          <h2 className="text-lg font-bold mb-4">{dbPoll.question}</h2>
          
          <div className="space-y-3">
            {dbPoll.options.map((option, index) => {
              const voteCount = dbPoll.votes?.[index] || 0;
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isSelected = dbPoll.user_vote === index;

              return (
                <div key={index} className="relative">
                  {hasVoted && (
                    <div 
                      className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <Button
                    variant="outline"
                    className={`w-full justify-between h-12 relative overflow-hidden ${isSelected ? 'border-primary ring-1 ring-primary' : ''}`}
                    onClick={() => !hasVoted && handleDbVote(index)}
                    disabled={hasVoted || voting}
                  >
                    <span className="z-10 flex items-center gap-2">
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                      {option}
                    </span>
                    {hasVoted && <span className="z-10 font-bold">{percentage}%</span>}
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            {hasVoted ? `${totalVotes} votes • Thanks for voting!` : "Vote to see what others think."}
          </p>
        </div>
      </Card>
    );
  }

  // Fallback to local poll
  return (
    <Card className="p-5 relative overflow-hidden border-none shadow-md">
      <div className={`absolute inset-0 bg-gradient-to-br ${fallbackPoll.color} opacity-10`} />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Daily Hot Take</h3>
        </div>
        
        <h2 className="text-lg font-bold mb-4">{fallbackPoll.question}</h2>
        
        <div className="space-y-3">
          <div className="relative">
            {localVote && (
              <div 
                className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg transition-all duration-1000 ease-out"
                style={{ width: `${localStats.a}%` }}
              />
            )}
            <Button
              variant="outline"
              className={`w-full justify-between h-12 relative overflow-hidden ${localVote === 'A' ? 'border-primary ring-1 ring-primary' : ''}`}
              onClick={() => !localVote && handleLocalVote('A')}
              disabled={!!localVote}
            >
              <span className="z-10 flex items-center gap-2">
                {localVote === 'A' && <Check className="h-4 w-4 text-primary" />}
                {fallbackPoll.optionA}
              </span>
              {localVote && <span className="z-10 font-bold">{localStats.a}%</span>}
            </Button>
          </div>

          <div className="relative">
            {localVote && (
              <div 
                className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg transition-all duration-1000 ease-out"
                style={{ width: `${localStats.b}%` }}
              />
            )}
            <Button
              variant="outline"
              className={`w-full justify-between h-12 relative overflow-hidden ${localVote === 'B' ? 'border-primary ring-1 ring-primary' : ''}`}
              onClick={() => !localVote && handleLocalVote('B')}
              disabled={!!localVote}
            >
              <span className="z-10 flex items-center gap-2">
                {localVote === 'B' && <Check className="h-4 w-4 text-primary" />}
                {fallbackPoll.optionB}
              </span>
              {localVote && <span className="z-10 font-bold">{localStats.b}%</span>}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          {localVote ? "Thanks for voting! Come back tomorrow." : "Vote to see what others think."}
        </p>
      </div>
    </Card>
  );
};
