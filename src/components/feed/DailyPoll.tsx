import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Check } from 'lucide-react';

const POLL_QUESTIONS = [
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
  // Use day of year to deterministically pick a poll
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const poll = POLL_QUESTIONS[dayOfYear % POLL_QUESTIONS.length];
  
  const [voted, setVoted] = useState<'A' | 'B' | null>(null);
  const [stats, setStats] = useState({ a: 45, b: 55 }); // Mock initial stats

  useEffect(() => {
    const savedVote = localStorage.getItem(`poll_vote_${dayOfYear}`);
    if (savedVote) {
      setVoted(savedVote as 'A' | 'B');
      // Randomize stats slightly based on day for variety
      setStats({
        a: 40 + (dayOfYear % 20),
        b: 100 - (40 + (dayOfYear % 20))
      });
    }
  }, [dayOfYear]);

  const handleVote = (option: 'A' | 'B') => {
    setVoted(option);
    localStorage.setItem(`poll_vote_${dayOfYear}`, option);
    
    // Simulate real-time update
    setStats(prev => ({
      a: option === 'A' ? prev.a + 1 : prev.a - 1,
      b: option === 'B' ? prev.b + 1 : prev.b - 1
    }));
  };

  return (
    <Card className="mx-4 mt-4 p-5 relative overflow-hidden border-none shadow-md">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${poll.color} opacity-10`} />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Daily Hot Take</h3>
        </div>
        
        <h2 className="text-lg font-bold mb-4">{poll.question}</h2>
        
        <div className="space-y-3">
          {/* Option A */}
          <div className="relative">
            {voted && (
              <div 
                className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg transition-all duration-1000 ease-out"
                style={{ width: `${stats.a}%` }}
              />
            )}
            <Button
              variant="outline"
              className={`w-full justify-between h-12 relative overflow-hidden ${voted === 'A' ? 'border-primary ring-1 ring-primary' : ''}`}
              onClick={() => !voted && handleVote('A')}
              disabled={!!voted}
            >
              <span className="z-10 flex items-center gap-2">
                {voted === 'A' && <Check className="h-4 w-4 text-primary" />}
                {poll.optionA}
              </span>
              {voted && <span className="z-10 font-bold">{stats.a}%</span>}
            </Button>
          </div>

          {/* Option B */}
          <div className="relative">
             {voted && (
              <div 
                className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg transition-all duration-1000 ease-out"
                style={{ width: `${stats.b}%` }}
              />
            )}
            <Button
              variant="outline"
              className={`w-full justify-between h-12 relative overflow-hidden ${voted === 'B' ? 'border-primary ring-1 ring-primary' : ''}`}
              onClick={() => !voted && handleVote('B')}
              disabled={!!voted}
            >
              <span className="z-10 flex items-center gap-2">
                {voted === 'B' && <Check className="h-4 w-4 text-primary" />}
                {poll.optionB}
              </span>
              {voted && <span className="z-10 font-bold">{stats.b}%</span>}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          {voted ? "Thanks for voting! Come back tomorrow." : "Vote to see what others think."}
        </p>
      </div>
    </Card>
  );
};
