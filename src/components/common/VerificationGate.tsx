import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface VerificationGateProps {
  children: ReactNode;
  requireVerification?: boolean;
  fallbackMessage?: string;
  onShowProfile?: () => void;
}

export const VerificationGate = ({ 
  children, 
  requireVerification = true, 
  fallbackMessage = "Complete identity verification to access this feature",
  onShowProfile
}: VerificationGateProps) => {
  const { userProfile } = useAuth();

  if (!requireVerification || !userProfile) {
    return <>{children}</>;
  }

  const isVerified = userProfile.verification_status === 'verified';
  const isUnderReview = userProfile.verification_status === 'under_review';
  const isPending = userProfile.verification_status === 'pending';

  if (isVerified) {
    return <>{children}</>;
  }

  const getStatusInfo = () => {
    if (isUnderReview) {
      return {
        icon: <Clock className="h-8 w-8 text-blue-500" />,
        title: "Verification in Progress",
        message: "Your identity documents are being reviewed. This usually takes 24-48 hours.",
        color: "border-blue-200 bg-blue-50/50"
      };
    } else if (isPending) {
      return {
        icon: <Shield className="h-8 w-8 text-yellow-500" />,
        title: "Identity Verification Required",
        message: fallbackMessage,
        color: "border-yellow-200 bg-yellow-50/50"
      };
    } else {
      return {
        icon: <Lock className="h-8 w-8 text-red-500" />,
        title: "Verification Failed",
        message: "Please resubmit your identity documents for verification.",
        color: "border-red-200 bg-red-50/50"
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${statusInfo.color} border-2`}>
        <CardContent className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            {statusInfo.icon}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{statusInfo.title}</h3>
            <p className="text-sm text-muted-foreground">
              {statusInfo.message}
            </p>
          </div>

          {isPending && onShowProfile && (
            <Button 
              onClick={onShowProfile}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Complete Verification
            </Button>
          )}

          {isUnderReview && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Clock className="h-4 w-4 animate-spin" />
              <span className="text-sm">Please wait...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};