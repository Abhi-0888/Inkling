import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';

export const ICEBREAKERS = [
  "What's the most spontaneous thing you've ever done?",
  "If you could have dinner with anyone, alive or dead, who would it be?",
  "What's a skill you've always wanted to learn?",
  "What's your go-to comfort movie or show?",
  "If you won the lottery tomorrow, what's the first thing you'd do?",
  "What's the best advice you've ever received?",
  "Do you believe in aliens? Why or why not?",
  "What's your unpopular opinion that you stand by?",
  "If you could live in any fictional world, which would it be?",
  "What's something that always makes you laugh?",
  "Coffee or tea? And how do you take it?",
  "What's on your bucket list that you haven't done yet?",
  "Are you a morning person or a night owl?",
  "What song is stuck in your head right now?",
  "If you could time travel, would you go to the past or future?",
  "What's your biggest turn-on?",
  "What's the wildest place you've ever hooked up?",
  "What's a secret you've never told anyone?",
  "Describe your perfect date night.",
  "What's the most romantic thing someone has done for you?",
  "What's your favorite physical feature on a partner?"
];

interface IcebreakerPromptProps {
  onUsePrompt: (prompt: string) => void;
}

export const IcebreakerPrompt = ({ onUsePrompt }: IcebreakerPromptProps) => {
  const [currentPrompt, setCurrentPrompt] = useState(() => 
    ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)]
  );
  const [isSpinning, setIsSpinning] = useState(false);

  const getNewPrompt = () => {
    setIsSpinning(true);
    let newPrompt = currentPrompt;
    while (newPrompt === currentPrompt) {
      newPrompt = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    }
    setTimeout(() => {
      setCurrentPrompt(newPrompt);
      setIsSpinning(false);
    }, 300);
  };

  return (
    <Card className="mx-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/20 rounded-full shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs font-medium text-primary mb-1">Icebreaker</p>
            <p className="text-sm text-foreground">{currentPrompt}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={getNewPrompt}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isSpinning ? 'animate-spin' : ''}`} />
              New Prompt
            </Button>
            <Button 
              size="sm" 
              onClick={() => onUsePrompt(currentPrompt)}
              className="text-xs"
            >
              Use This
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
