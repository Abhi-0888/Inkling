import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Flag, Globe, School, Sparkles } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Post, Reaction } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post & {
    reactions: Reaction[];
    comments_count: number;
    user_reaction?: Reaction;
    author?: { display_name: string };
  };
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onSecretLike?: (postId: string) => void;
}

export const PostCard = ({ post, onLike, onComment, onSecretLike }: PostCardProps) => {
  const [showSecretLike, setShowSecretLike] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const likesCount = post.reactions.filter(r => r.type === 'like').length;
  const isLiked = !!post.user_reaction;

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
    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {post.author?.display_name || 'Anonymous'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistance(new Date(post.created_at), new Date(), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {post.visibility === 'campus' ? (
                <><School className="h-3 w-3 mr-1" /> Campus</>
              ) : (
                <><Globe className="h-3 w-3 mr-1" /> Global</>
              )}
            </Badge>
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-foreground leading-relaxed">{post.content}</p>
          
          {post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt="Post content"
                  className="rounded-lg w-full h-32 object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={cn(
                "flex items-center space-x-1",
                isLiked && "text-red-500 hover:text-red-600"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              <span>{likesCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment(post.id)}
              className="flex items-center space-x-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </Button>
          </div>

          {onSecretLike && userProfile?.id !== post.author_id && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSecretLike(!showSecretLike)}
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                <span className="text-xs">Vibe</span>
              </Button>
              
              {showSecretLike && (
                <div className="absolute right-0 bottom-full mb-2 bg-popover border border-border rounded-lg p-3 shadow-lg z-10 w-64">
                  <p className="text-sm font-medium mb-2">Send a secret like?</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    They'll only know if they like you back. Then you can chat privately!
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleSecretLike}
                      className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    >
                      Send ✨
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
  );
};