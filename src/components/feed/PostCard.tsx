import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Flag, Globe, School, Sparkles, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { PostWithStats } from '@/services/postService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ReportDialog } from '@/components/moderation/ReportDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  post: PostWithStats & {
    author?: { display_name: string };
  };
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onSecretLike?: (postId: string) => void;
}

const MAX_CONTENT_LENGTH = 280;

// Helper function to render content with styled hashtags
const renderContentWithHashtags = (text: string) => {
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span 
          key={index} 
          className="text-primary font-medium hover:underline cursor-pointer"
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

export const PostCard = ({ post, onLike, onComment, onSecretLike }: PostCardProps) => {
  const [showSecretLike, setShowSecretLike] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isDoubleTapAnimating, setIsDoubleTapAnimating] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const likesCount = post.like_count || 0;
  const commentsCount = post.comment_count || 0;
  const isLiked = post.user_has_liked || false;
  const isLongContent = post.content.length > MAX_CONTENT_LENGTH;
  const displayContent = isLongContent && !isExpanded 
    ? post.content.slice(0, MAX_CONTENT_LENGTH) + '...'
    : post.content;

  // Determine gradient based on content length or random factor for visual variety
  const getGradientClass = () => {
    const len = post.content.length;
    if (len < 50) return "bg-gradient-to-br from-pink-500/10 to-rose-500/5 border-pink-500/20";
    if (len > 200) return "bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20";
    if (post.images && post.images.length > 0) return "bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border-purple-500/20";
    return "bg-card/50";
  };

  const handleLike = () => {
    setIsLikeAnimating(true);
    onLike(post.id);
    setTimeout(() => setIsLikeAnimating(false), 300);
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
    setIsDoubleTapAnimating(true);
    setTimeout(() => setIsDoubleTapAnimating(false), 800);
  };

  const handleSecretLike = () => {
    if (onSecretLike) {
      onSecretLike(post.id);
      setShowSecretLike(false);
      toast({
        title: "Secret like sent! ✨",
        description: "If they like you back, you'll match and can chat privately",
      });
    }
  };

  return (
    <>
      <Card 
        className={cn(
            "border shadow-sm backdrop-blur-sm hover:shadow-md transition-all duration-300 animate-fade-in group relative overflow-hidden",
            getGradientClass()
        )}
        onDoubleClick={handleDoubleTap}
      >
        {/* Double Tap Heart Animation Overlay */}
        {isDoubleTapAnimating && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <Heart className="w-24 h-24 text-red-500 fill-current animate-ping" />
            </div>
        )}

        <CardContent className="p-4 space-y-3 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {post.author?.display_name || 'Anonymous'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistance(new Date(post.created_at), new Date(), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {post.visibility === 'campus' ? (
                  <><School className="h-3 w-3 mr-1" /> Campus</>
                ) : (
                  <><Globe className="h-3 w-3 mr-1" /> Global</>
                )}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => setShowReportDialog(true)}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {renderContentWithHashtags(displayContent)}
            </p>
            {isLongContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary hover:text-primary/80 -ml-2"
              >
                {isExpanded ? (
                  <><ChevronUp className="h-4 w-4 mr-1" /> Show less</>
                ) : (
                  <><ChevronDown className="h-4 w-4 mr-1" /> Read more</>
                )}
              </Button>
            )}
            
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {post.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt="Post content"
                    className="rounded-lg w-full h-32 object-cover transition-transform duration-200 hover:scale-[1.02]"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-1.5 transition-all duration-200",
                  isLiked && "text-red-500 hover:text-red-600"
                )}
              >
                <Heart 
                  className={cn(
                    "h-5 w-5 transition-transform", 
                    isLiked && "fill-current",
                    isLikeAnimating && "animate-heart-pulse"
                  )} 
                />
                <span className="text-sm font-medium">{likesCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onComment(post.id)}
                className="flex items-center gap-1.5 transition-all duration-200"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{commentsCount}</span>
              </Button>
            </div>

            {onSecretLike && userProfile?.id !== post.author_id && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecretLike(!showSecretLike)}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-medium">Vibe</span>
                </Button>
                
                {showSecretLike && (
                  <div className="absolute right-0 bottom-full mb-2 bg-popover border border-border rounded-xl p-4 shadow-lg z-10 w-72 animate-scale-in">
                    <p className="text-sm font-semibold mb-2">Send a secret like?</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      They'll only know if they like you back. Then you can chat privately!
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSecretLike}
                        className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSecretLike(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        contentId={post.id}
        contentType="post"
      />
    </>
  );
};
