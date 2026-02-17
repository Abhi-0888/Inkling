import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const VerificationPending = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Verification submitted ⏳
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We're reviewing your ID. You'll be notified once approved.
          </p>
          <p className="text-sm text-muted-foreground">
            This usually takes less than 24 hours.
          </p>
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="w-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};