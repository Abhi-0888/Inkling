import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { User, Heart, Shield, Sparkles } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AppHeaderProps {
  onShowProfile: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AppHeader = ({ onShowProfile, activeTab, onTabChange }: AppHeaderProps) => {
  const { isModerator } = useAdmin();

  const getTitle = () => {
    switch (activeTab) {
      case 'dark-desire': return '🔥 Dark Desire';
      case 'blind-date': return '💫 Blind Date';
      case 'matching': return '❤️ Match';
      case 'chatting': return '💬 Messages';
      case 'discover': return '✨ Discover';
      default: return 'Inkling';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'dark-desire': return 'Anonymous confessions';
      case 'blind-date': return 'Random anonymous chat';
      case 'matching': return 'Find your spark';
      case 'chatting': return 'Your conversations';
      case 'discover': return 'Explore features';
      default: return 'Campus connections';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-14 items-center justify-between px-4">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Heart className="h-5 w-5 text-white fill-white/30" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">
              {getTitle()}
            </h1>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {getSubtitle()}
            </p>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-1">
          {isModerator && (
            <Link to="/admin">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-xl"
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
            className="hover:bg-primary/10 transition-colors rounded-xl"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
