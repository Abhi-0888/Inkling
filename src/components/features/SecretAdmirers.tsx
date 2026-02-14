import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, EyeOff, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecretAdmirer {
  id: string;
  source_user_id: string;
  created_at: string;
}

export const SecretAdmirers = () => {
  const { user } = useAuth();
  const [admirers, setAdmirers] = useState<SecretAdmirer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAdmirers();
    }
  }, [user]);

  const loadAdmirers = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('secret_likes')
      .select('id, source_user_id, created_at')
      .eq('target_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error) {
      setAdmirers(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6 h-32" />
      </Card>
    );
  }

  if (admirers.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10">
        <CardContent className="p-6 text-center">
          <EyeOff className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold mb-1">No Secret Admirers Yet</h3>
          <p className="text-sm text-muted-foreground">
            Keep posting and engaging to attract attention!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-pink-500" />
          <h3 className="font-semibold">Secret Admirers</h3>
          <Badge variant="secondary" className="ml-auto">
            {admirers.length}
          </Badge>
        </div>

        <div className="space-y-3">
          {admirers.map((admirer, index) => (
            <div 
              key={admirer.id}
              className="flex items-center gap-3 p-3 bg-background/50 rounded-lg"
            >
              {/* Blurred avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-md" />
                <span className="text-white text-lg font-bold relative z-10">?</span>
              </div>
              
              <div className="flex-1">
                <p className="font-medium blur-sm select-none">
                  Mystery Admirer #{index + 1}
                </p>
                <p className="text-xs text-muted-foreground">
                  Liked you secretly
                </p>
              </div>
              
              <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg text-center">
          <p className="text-sm font-medium mb-2">
            Reveal who likes you! 💕
          </p>
          <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500">
            Upgrade to See
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
