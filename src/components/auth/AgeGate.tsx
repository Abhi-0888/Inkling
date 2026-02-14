import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Shield, Users } from 'lucide-react';

interface AgeGateProps {
  onContinue: () => void;
}

export const AgeGate = ({ onContinue }: AgeGateProps) => {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [codeOfConductAccepted, setCodeOfConductAccepted] = useState(false);

  const canContinue = ageConfirmed && termsAccepted && codeOfConductAccepted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Inkling
          </CardTitle>
          <p className="text-muted-foreground">
            Before we begin, we need to confirm a few things to keep our community safe.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="age" 
                checked={ageConfirmed}
                onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
              />
              <div className="space-y-1">
                <label 
                  htmlFor="age" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I am 18 years or older
                </label>
                <p className="text-xs text-muted-foreground">
                  Inkling is exclusively for college students who are 18+
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <div className="space-y-1">
                <label 
                  htmlFor="terms" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the Terms of Service and Privacy Policy
                </label>
                <p className="text-xs text-muted-foreground">
                  <a href="/terms" className="text-primary hover:underline">Terms</a> • <a href="/privacy" className="text-primary hover:underline">Privacy</a>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="code" 
                checked={codeOfConductAccepted}
                onCheckedChange={(checked) => setCodeOfConductAccepted(checked as boolean)}
              />
              <div className="space-y-1">
                <label 
                  htmlFor="code" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to follow the Community Guidelines
                </label>
                <p className="text-xs text-muted-foreground">
                  Respectful, anonymous, and safe interactions for everyone
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Your Privacy Matters</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• All posts and interactions are completely anonymous</p>
              <p>• We never share your personal information</p>
              <p>• You control what you share and when</p>
            </div>
          </div>

          <Button 
            onClick={onContinue}
            disabled={!canContinue}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            Continue to Verification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};