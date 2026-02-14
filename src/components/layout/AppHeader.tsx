import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { User, Heart, Shield } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Link } from 'react-router-dom';

interface AppHeaderProps {
  onShowProfile: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AppHeader = ({ onShowProfile, activeTab, onTabChange }: AppHeaderProps) => {
  const { isModerator } = useAdmin();

  const getTitle = () => {
    switch (activeTab) {
      case 'dark-desire': return 'Dark Desire';
      case 'blind-date': return 'Blind Date';
      case 'matching': return 'Matching';
      case 'chatting': return 'Chatting';
      default: return 'Inkling';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Heart className="h-6 w-6 text-primary fill-primary drop-shadow-sm" />
            <div className="absolute inset-0 h-6 w-6 text-primary fill-primary blur-sm opacity-50" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {getTitle()}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          {isModerator && (
            <Link to="/admin">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Shield className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <NotificationBell onNavigate={onTabChange} />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onShowProfile}
            className="hover:bg-primary/10 transition-colors"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
