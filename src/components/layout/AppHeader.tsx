import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { User, Heart, Shield, Sparkles } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
              <Heart className="h-5 w-5 text-white fill-white/30" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full animate-pulse" />
          </motion.div>

          <div className="relative h-10 w-48">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <h1 className="text-lg font-bold leading-tight truncate">
                  {getTitle()}
                </h1>
                <p className="text-[10px] text-muted-foreground leading-tight truncate">
                  {getSubtitle()}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isModerator && (
            <Link to="/admin">
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--primary) / 0.1)" }}
                  whileTap={{ scale: 0.9 }}
                  className="rounded-xl text-muted-foreground hover:text-primary transition-colors"
                >
                  <Shield className="h-5 w-5" />
                </motion.button>
              </Button>
            </Link>
          )}

          <div className="relative">
            <NotificationBell onNavigate={onTabChange} />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onShowProfile}
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--primary) / 0.1)" }}
              whileTap={{ scale: 0.9 }}
              className="rounded-xl relative"
            >
              <User className="h-5 w-5" />
            </motion.button>
          </Button>
        </div>
      </div>
    </header>
  );
};
