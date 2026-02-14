import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, UserCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    reference_id: string | null;
    created_at: string;
  };
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'blind_date_match':
      return <Users className="h-5 w-5 text-purple-500" />;
    case 'match':
      return <UserCheck className="h-5 w-5 text-pink-500" />;
    case 'reaction':
      return <Heart className="h-5 w-5 text-red-500" />;
    case 'comment':
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    default:
      return <MessageCircle className="h-5 w-5 text-gray-500" />;
  }
};

export const NotificationItem = ({ notification, onMarkAsRead, onClose, onNavigate }: NotificationItemProps) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    if (onNavigate) {
      switch (notification.type) {
        case 'match':
        case 'blind_date_match':
          onNavigate('chatting');
          break;
        case 'reaction':
        case 'comment':
          // Ideally we would check the post type, but for now default to feed
          // or we could check if it's a dark desire post via another query, but that's slow.
          // Let's assume most reactions are on feed.
          onNavigate('feed');
          break;
        default:
          break;
      }
    }
    
    onClose();
  };

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-colors hover:bg-accent/50",
        !notification.read && "bg-accent/20 border-primary/20"
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1">{notification.title}</p>
          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        {!notification.read && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-primary rounded-full" />
          </div>
        )}
      </div>
    </Card>
  );
};
