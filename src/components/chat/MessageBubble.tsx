import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  showTimestamp?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

export const MessageBubble = ({ 
  content, 
  timestamp, 
  isOwn, 
  showTimestamp = true,
  isFirstInGroup = true,
  isLastInGroup = true
}: MessageBubbleProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div
      className={cn(
        "flex animate-fade-in",
        isOwn ? "justify-end" : "justify-start",
        !isLastInGroup && "mb-0.5"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] px-4 py-2 transition-all duration-200",
          isOwn 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-foreground",
          // Rounded corners based on grouping
          isOwn ? (
            isFirstInGroup && isLastInGroup ? "rounded-2xl" :
            isFirstInGroup ? "rounded-2xl rounded-br-md" :
            isLastInGroup ? "rounded-2xl rounded-tr-md" :
            "rounded-2xl rounded-r-md"
          ) : (
            isFirstInGroup && isLastInGroup ? "rounded-2xl" :
            isFirstInGroup ? "rounded-2xl rounded-bl-md" :
            isLastInGroup ? "rounded-2xl rounded-tl-md" :
            "rounded-2xl rounded-l-md"
          )
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        {showTimestamp && isLastInGroup && (
          <p
            className={cn(
              "text-[10px] mt-1 opacity-70",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
};
