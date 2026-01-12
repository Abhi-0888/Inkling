import { Home, Flame, Eye, Sparkles, MessageCircle, Calendar, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'discover', icon: Sparkles, label: 'Discover' },
    { id: 'blind-date', icon: Eye, label: 'Blind' },
    { id: 'matching', icon: Brain, label: 'Match' },
    { id: 'chatting', icon: MessageCircle, label: 'Chat' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border z-50">
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center space-y-1 h-auto py-2 px-3 min-w-0",
              activeTab === id 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};