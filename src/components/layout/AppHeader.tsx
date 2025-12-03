import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { Heart } from 'lucide-react';

interface AppHeaderProps {
  onShowProfile: () => void;
}

export const AppHeader = ({ onShowProfile }: AppHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary fill-primary" />
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Inkling
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <Button variant="ghost" size="icon" onClick={onShowProfile}>
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
