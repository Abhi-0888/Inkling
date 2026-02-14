import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Clock, Check } from 'lucide-react';
import { getActivePolls, votePoll, CampusPoll } from '@/services/pollService';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export const CampusPolls = () => {
  const [polls, setPolls] = useState<CampusPoll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    setLoading(true);
    const data = await getActivePolls();
    setPolls(data);
    setLoading(false);
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    const success = await votePoll(pollId, optionIndex);
    if (success) {
      toast.success('Vote recorded!');
      loadPolls();
    } else {
      toast.error('Failed to vote');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 h-40" />
          </Card>
        ))}
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-8 text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No active polls</p>
          <p className="text-sm">Check back later!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Campus Polls</h2>
      </div>

      {polls.map(poll => {
        const hasVoted = poll.user_vote !== null;
        const totalVotes = poll.total_votes || 0;

        return (
          <Card 
            key={poll.id} 
            className={poll.is_featured ? 'border-primary/50 bg-primary/5' : ''}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {poll.is_featured && (
                    <Badge variant="secondary" className="text-xs">Featured</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {poll.category}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}
                </span>
              </div>

              <p className="font-medium mb-4">{poll.question}</p>

              <div className="space-y-2">
                {poll.options.map((option, index) => {
                  const voteCount = poll.votes?.[index] || 0;
                  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                  const isSelected = poll.user_vote === index;

                  return (
                    <div key={index} className="relative">
                      {hasVoted ? (
                        <div className="relative">
                          <Progress 
                            value={percentage} 
                            className="h-10"
                          />
                          <div className="absolute inset-0 flex items-center justify-between px-3">
                            <span className="text-sm font-medium flex items-center gap-1">
                              {isSelected && <Check className="h-4 w-4 text-primary" />}
                              {option}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full justify-start h-10"
                          onClick={() => handleVote(poll.id, index)}
                        >
                          {option}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
