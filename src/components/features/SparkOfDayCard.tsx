import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Clock, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTodaySpark, generateDailySpark, revealSpark, SparkOfDay } from '@/services/sparkOfDayService';
import { motion, AnimatePresence } from 'framer-motion';

export const SparkOfDayCard = () => {
  const { user } = useAuth();
  const [spark, setSpark] = useState<SparkOfDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (user) {
      loadSpark();
    }
  }, [user]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setCountdown(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadSpark = async () => {
    if (!user) return;
    setLoading(true);
    
    let todaySpark = await getTodaySpark(user.id);
    
    if (!todaySpark) {
      todaySpark = await generateDailySpark(user.id);
    }
    
    setSpark(todaySpark);
    setLoading(false);
  };

  const handleReveal = async () => {
    if (!spark) return;
    setRevealing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = await revealSpark(spark.id);
    if (success) {
      setSpark({ ...spark, revealed: true });
    }
    setRevealing(false);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span>Finding your spark...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!spark) {
    return (
      <Card className="bg-gradient-to-br from-muted to-muted/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No spark available today</p>
          <p className="text-sm">Check back tomorrow!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/30 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="font-semibold text-lg">Spark of the Day</h3>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {countdown}
          </Badge>
        </div>

        <AnimatePresence mode="wait">
          {!spark.revealed ? (
            <motion.div
              key="hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <div className="relative inline-block">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center ${revealing ? 'animate-spin' : ''}`}>
                  <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center">
                    {revealing ? (
                      <Heart className="h-8 w-8 text-primary animate-pulse" />
                    ) : (
                      <span className="text-3xl">?</span>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Your special match is waiting to be revealed!
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="secondary">
                  {spark.compatibility_score}% compatible
                </Badge>
              </div>
              
              <Button 
                onClick={handleReveal} 
                disabled={revealing}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Eye className="mr-2 h-4 w-4" />
                {revealing ? 'Revealing...' : 'Reveal Your Spark'}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.9, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="text-center py-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                {spark.matched_user?.display_name?.[0]?.toUpperCase() || '?'}
              </div>
              
              <h4 className="font-semibold text-xl mb-1">
                {spark.matched_user?.display_name || 'Mystery Match'}
              </h4>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-gradient-to-r from-primary to-secondary">
                  {spark.compatibility_score}% Match
                </Badge>
                {spark.matched_user?.photo_verified && (
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              
              <Button className="w-full">
                <Heart className="mr-2 h-4 w-4" />
                Send a Like
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
