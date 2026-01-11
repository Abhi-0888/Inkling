import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnreadIndicatorProps {
  count: number;
  onClick: () => void;
}

export const UnreadIndicator = ({ count, onClick }: UnreadIndicatorProps) => {
  if (count === 0) return null;

  return (
    <Button
      onClick={onClick}
      size="sm"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full shadow-lg animate-bounce-subtle bg-primary hover:bg-primary/90"
    >
      <ChevronDown className="h-4 w-4 mr-1" />
      {count} new {count === 1 ? 'message' : 'messages'}
    </Button>
  );
};
