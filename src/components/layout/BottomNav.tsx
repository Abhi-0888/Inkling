import { Home, Flame, Sparkles, MessageCircle, Heart, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navItems = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'discover', icon: Sparkles, label: 'Discover' },
    { id: 'dark-desire', icon: Flame, label: 'Confess', isCenter: true },
    { id: 'blind-date', icon: Users, label: 'Blind Date' },
    { id: 'matching', icon: Heart, label: 'Match' },
    { id: 'chatting', icon: MessageCircle, label: 'Chat' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-lg">
        <div className="flex items-end justify-around px-2 max-w-lg mx-auto h-16 relative">
          {navItems.map(({ id, icon: Icon, label, isCenter }) => {
            const isActive = activeTab === id;
            
            if (isCenter) {
              return (
                <div key={id} className="flex flex-col items-center relative -mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onTabChange(id)}
                    className={cn(
                      "relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 border-4 border-card",
                      isActive
                        ? "bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 shadow-orange-500/40"
                        : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:from-orange-500 hover:via-red-500 hover:to-pink-600 hover:shadow-orange-500/30"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-40"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <Icon className="h-6 w-6 text-white relative z-10" />
                  </motion.button>
                  <span className={cn(
                    "text-[10px] font-medium mt-1 transition-colors",
                    isActive ? "text-orange-500" : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                </div>
              );
            }

            return (
              <motion.button
                key={id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-xl transition-all duration-200 min-w-[52px]",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn(
                  "h-5 w-5 relative z-10 transition-all",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "relative z-10 text-[10px] font-medium transition-all whitespace-nowrap",
                  isActive && "font-semibold"
                )}>
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};