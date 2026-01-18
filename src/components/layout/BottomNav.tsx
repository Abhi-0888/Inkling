import { Home, Flame, Sparkles, MessageCircle, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const leftTabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'discover', icon: Sparkles, label: 'Discover' },
  ];
  
  const rightTabs = [
    { id: 'blind-date', icon: Users, label: 'Blind Date' },
    { id: 'matching', icon: Heart, label: 'Match' },
    { id: 'chatting', icon: MessageCircle, label: 'Chat' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Main nav bar with elevated FAB */}
      <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-lg">
        <div className="flex items-end justify-between px-3 max-w-lg mx-auto relative">
          {/* Left tabs */}
          <div className="flex items-end gap-1">
            {leftTabs.map(({ id, icon: Icon, label }) => (
              <NavItem 
                key={id} 
                id={id} 
                icon={Icon} 
                label={label} 
                isActive={activeTab === id}
                onClick={() => onTabChange(id)}
              />
            ))}
          </div>
          
          {/* Center FAB - elevated */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange('dark-desire')}
              className={cn(
                "relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 border-4 border-card",
                activeTab === 'dark-desire'
                  ? "bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 shadow-orange-500/40"
                  : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:from-orange-500 hover:via-red-500 hover:to-pink-600 hover:shadow-orange-500/30"
              )}
            >
              {/* Glow ring effect */}
              {activeTab === 'dark-desire' && (
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-40"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <Flame className={cn(
                "h-6 w-6 text-white relative z-10",
                activeTab === 'dark-desire' && "drop-shadow-lg"
              )} />
            </motion.button>
          </div>
          
          {/* Center spacer */}
          <div className="w-20 py-2">
            <span className={cn(
              "block text-center text-[9px] font-semibold mt-8 transition-colors",
              activeTab === 'dark-desire' ? "text-orange-500" : "text-muted-foreground"
            )}>
              Confess
            </span>
          </div>
          
          {/* Right tabs */}
          <div className="flex items-end gap-1">
            {rightTabs.map(({ id, icon: Icon, label }) => (
              <NavItem 
                key={id} 
                id={id} 
                icon={Icon} 
                label={label} 
                isActive={activeTab === id}
                onClick={() => onTabChange(id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  id: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ id, icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[56px]",
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
      "relative z-10 text-[10px] font-medium transition-all",
      isActive && "font-semibold"
    )}>
      {label}
    </span>
  </motion.button>
);