import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Globe, School, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { postService } from '@/services/postService';
import { useAuth } from '@/contexts/AuthContext';

interface PostComposerProps {
  onClose: () => void;
  onPostCreated: () => void;
  section?: 'feed' | 'dark_desire';
  placeholder?: string;
  title?: string;
}

export const PostComposer = ({ 
  onClose, 
  onPostCreated, 
  section = 'feed',
  placeholder = "What's on your mind?",
  title = "Create Post"
}: PostComposerProps) => {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'campus' | 'global'>('campus');
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Post is empty",
        description: "Please write something before posting",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile) return;

    setLoading(true);
    try {
      await postService.createPost(content.trim(), 'text', visibility, [], section);

      toast({
        title: "Posted successfully",
        description: "Your anonymous post is now live!",
      });

      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Failed to post",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none border-0 bg-muted/30 focus-visible:ring-0 focus-visible:ring-offset-0"
            maxLength={500}
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{content.length}/500</span>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" disabled>
                <Image className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Visibility</label>
            <Select value={visibility} onValueChange={(value) => setVisibility(value as 'campus' | 'global')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campus">
                  <div className="flex items-center space-x-2">
                    <School className="h-4 w-4" />
                    <span>Campus Only</span>
                  </div>
                </SelectItem>
                <SelectItem value="global">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>All Colleges</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">Anonymous Mode</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your identity is completely hidden. Nobody can trace this post back to you.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {loading ? "Posting..." : "Post Anonymously"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};