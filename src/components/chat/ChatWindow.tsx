import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image, Dices } from 'lucide-react';
import { blindDateService } from '@/services/blindDateService';
import { matchingService } from '@/services/matchingService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { IcebreakerPrompt, ICEBREAKERS } from './IcebreakerPrompt';
import { ChatExpiryTimer } from './ChatExpiryTimer';
import { MessageBubble } from './MessageBubble';
import { UnreadIndicator } from './UnreadIndicator';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  media_ref?: string;
}

interface ChatWindowProps {
  type: 'match' | 'blind_date';
  sessionId: string;
  expiresAt?: string;
  onSessionEnd?: () => void;
}

// Group messages by sender and time proximity (2 minutes)
const groupMessages = (messages: ChatMessage[]) => {
  const groups: { messages: ChatMessage[]; senderId: string }[] = [];
  
  messages.forEach((msg, idx) => {
    const prevMsg = messages[idx - 1];
    const timeDiff = prevMsg 
      ? new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()
      : Infinity;
    
    // Start new group if different sender or more than 2 minutes apart
    if (!prevMsg || prevMsg.sender_id !== msg.sender_id || timeDiff > 2 * 60 * 1000) {
      groups.push({ messages: [msg], senderId: msg.sender_id });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  });
  
  return groups;
};

export const ChatWindow = ({ type, sessionId, expiresAt, onSessionEnd }: ChatWindowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showIcebreaker, setShowIcebreaker] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${sessionId}`
        },
        (payload) => {
          const newMsg: ChatMessage = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            media_ref: payload.new.media_ref
          };
          setMessages(prev => [...prev, newMsg]);
          
          // If not at bottom, increment unread count
          if (!isAtBottom && newMsg.sender_id !== user?.id) {
            setUnreadCount(prev => prev + 1);
          } else {
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, type, isAtBottom, user?.id]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isAtBottom]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(isNearBottom);
    
    if (isNearBottom) {
      setUnreadCount(0);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUnreadCount(0);
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const msgs = type === 'match' 
        ? await matchingService.getMessages(sessionId)
        : await blindDateService.getMessages(sessionId);
      setMessages(msgs);
      setShowIcebreaker(msgs.length === 0);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      if (type === 'match') {
        await matchingService.sendMessage(sessionId, newMessage.trim());
      } else {
        await blindDateService.sendMessage(sessionId, newMessage.trim());
      }
      setNewMessage('');
      setShowIcebreaker(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleUseIcebreaker = (prompt: string) => {
    setNewMessage(prompt);
    setShowIcebreaker(false);
  };

  const insertRandomIcebreaker = () => {
    const randomPrompt = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    setNewMessage(randomPrompt);
  };

  const messageGroups = groupMessages(messages);

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-64'} rounded-2xl`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Expiry Timer for blind dates */}
      {type === 'blind_date' && expiresAt && (
        <div className="flex justify-center py-2 border-b border-border bg-background/50">
          <ChatExpiryTimer expiresAt={expiresAt} onExpire={onSessionEnd} />
        </div>
      )}

      {/* Chat Messages */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {/* Icebreaker for empty chats */}
        {showIcebreaker && messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">
                {type === 'blind_date' 
                  ? "Start your anonymous conversation..." 
                  : "Your chat begins here..."}
              </p>
            </div>
            <IcebreakerPrompt onUsePrompt={handleUseIcebreaker} />
          </div>
        )}

        {/* Message Groups */}
        {messageGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-0.5">
            {group.messages.map((message, msgIdx) => {
              const isOwn = message.sender_id === user?.id;
              const isFirst = msgIdx === 0;
              const isLast = msgIdx === group.messages.length - 1;
              
              return (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  timestamp={message.created_at}
                  isOwn={isOwn}
                  isFirstInGroup={isFirst}
                  isLastInGroup={isLast}
                  showTimestamp={isLast}
                />
              );
            })}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Unread Indicator */}
      <UnreadIndicator count={unreadCount} onClick={scrollToBottom} />

      {/* Message Input */}
      <div className="border-t border-border p-4 bg-background">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-primary"
            onClick={insertRandomIcebreaker}
            title="Random Icebreaker"
          >
            <Dices className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-primary"
            disabled
          >
            <Image className="h-5 w-5" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
            disabled={sending}
          />
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="shrink-0 bg-primary hover:bg-primary/90 rounded-full h-10 w-10 shadow-sm"
          >
            <Send className={`h-4 w-4 ${sending ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};
