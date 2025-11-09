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

export const NotificationItem = ({ notification, onMarkAsRead, onClose }: NotificationItemProps) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    // Could add navigation logic here based on notification type
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
