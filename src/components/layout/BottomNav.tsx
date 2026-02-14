import { Home, Flame, Sparkles, MessageCircle, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'discover', icon: Sparkles, label: 'Discover' },
    { id: 'blind-date', icon: Users, label: 'Blind Date', highlight: true },
    { id: 'matching', icon: Heart, label: 'Match' },
    { id: 'chatting', icon: MessageCircle, label: 'Chat' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 shadow-lg">
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {tabs.map(({ id, icon: Icon, label, highlight }) => {
          const isActive = activeTab === id;
          
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 min-w-[56px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={cn(
                    "absolute inset-0 rounded-xl",
                    highlight 
                      ? "bg-gradient-to-br from-pink-500/20 to-purple-500/20" 
                      : "bg-primary/10"
                  )}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className={cn(
                "relative z-10 p-1 rounded-full transition-all",
                highlight && !isActive && "bg-gradient-to-br from-pink-500/10 to-purple-500/10"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110",
                  highlight && "text-pink-500"
                )} />
              </div>
              <span className={cn(
                "relative z-10 text-[10px] font-medium transition-all",
                isActive && "font-semibold"
              )}>
                {label}
              </span>
              {highlight && !isActive && (
                <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Confess FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onTabChange('dark-desire')}
        className={cn(
          "absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all",
          activeTab === 'dark-desire'
            ? "bg-gradient-to-br from-orange-500 to-red-600 ring-4 ring-orange-500/30"
            : "bg-gradient-to-br from-gray-800 to-gray-900 hover:from-orange-500 hover:to-red-600"
        )}
      >
        <Flame className={cn(
          "h-6 w-6 text-white",
          activeTab === 'dark-desire' && "animate-pulse"
        )} />
      </motion.button>
    </div>
  );
};