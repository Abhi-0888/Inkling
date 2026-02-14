import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatExpiryTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export const ChatExpiryTimer = ({ expiresAt, onExpire }: ChatExpiryTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        onExpire?.();
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Less than 1 hour is urgent
      setIsUrgent(hours < 1);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full animate-pulse">
        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        <span className="text-xs font-medium text-destructive">Chat Expired</span>
      </div>
    );
  }

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
        isUrgent 
          ? "bg-destructive/10 text-destructive animate-pulse" 
          : "bg-muted text-muted-foreground"
      )}
    >
      <Clock className={cn("h-3.5 w-3.5", isUrgent && "animate-pulse")} />
      <span className="text-xs font-mono font-medium">
        {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
      </span>
      <span className="text-xs">left</span>
    </div>
  );
};
