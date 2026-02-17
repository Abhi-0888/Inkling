import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/pages/LandingPage';
import { AgeGate } from '@/components/auth/AgeGate';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SignInForm } from '@/components/SignInForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ResetPasswordPage } from '@/components/auth/ResetPasswordPage';
import { Feed } from '@/components/feed/Feed';
import { DarkDesire } from '@/components/sections/DarkDesire';
import { BlindDate } from '@/components/sections/BlindDate';
import { Matching } from '@/components/sections/Matching';
import { Chatting } from '@/components/sections/Chatting';
import { Discover } from '@/components/sections/Discover';
import { BottomNav } from '@/components/layout/BottomNav';
import { AppHeader } from '@/components/layout/AppHeader';
import { ProfileManager } from '@/components/profile/ProfileManager';
import { IdentityVerificationForm } from '@/components/auth/IdentityVerificationForm';
import { VerificationPending } from '@/components/auth/VerificationPending';
import { ensureBasicData } from '@/utils/seedData';

const Index = () => {
  const { user, userProfile, loading, isPasswordRecovery, clearPasswordRecovery } = useAuth();
  const [onboardingStep, setOnboardingStep] = useState<'landing' | 'signin' | 'age-gate' | 'signup' | 'forgot-password'>('landing');
  const [activeTab, setActiveTab] = useState('feed');
  const [showProfile, setShowProfile] = useState(false);

  // Seed database with initial data when user logs in and is verified
  useEffect(() => {
    if (user?.id && userProfile?.verification_status === 'verified') {
      ensureBasicData(user.id);
    }
  }, [user?.id, userProfile?.verification_status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show password reset page if user clicked reset link from email
  if (isPasswordRecovery && user) {
    return (
      <ResetPasswordPage onSuccess={clearPasswordRecovery} />
    );
  }

  // If user is authenticated, check verification status
  if (user) {
    const verificationStatus = userProfile?.verification_status;

    // Step 1: If verification is pending (just signed up, needs to submit ID)
    if (!verificationStatus || verificationStatus === 'pending') {
      return (
        <div className="min-h-screen bg-background">
          <IdentityVerificationForm 
            onVerificationSubmitted={() => {
              // Profile will be refetched by AuthContext, triggering re-render
              // to show the "under_review" state
            }}
          />
        </div>
      );
    }

    // Step 2: If verification is under review, show pending message
    if (verificationStatus === 'under_review') {
      return <VerificationPending />;
    }

    // Step 3: If verification was rejected, allow re-submission
    if (verificationStatus === 'rejected') {
      return (
        <div className="min-h-screen bg-background">
          <IdentityVerificationForm 
            onVerificationSubmitted={() => {}}
          />
        </div>
      );
    }

    // Step 4: User is verified — show main app
    return (
      <div className="min-h-screen bg-background">
        <AppHeader activeTab={activeTab} onShowProfile={() => setShowProfile(true)} onTabChange={setActiveTab} />
        <div className="pt-14">
          {activeTab === 'feed' && <Feed onPostClick={() => {}} onShowProfile={() => setShowProfile(true)} />}
          {activeTab === 'discover' && <Discover onShowProfile={() => setShowProfile(true)} />}
          {activeTab === 'dark-desire' && <DarkDesire onShowProfile={() => setShowProfile(true)} />}
          {activeTab === 'blind-date' && <BlindDate />}
          {activeTab === 'matching' && <Matching />}
          {activeTab === 'chatting' && <Chatting />}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        
        {showProfile && (
          <ProfileManager onClose={() => setShowProfile(false)} />
        )}
      </div>
    );
  }

  // Onboarding flow for unauthenticated users
  if (onboardingStep === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setOnboardingStep('age-gate')}
        onSignIn={() => setOnboardingStep('signin')}
      />
    );
  }

  if (onboardingStep === 'signin') {
    return (
      <SignInForm
        onNeedAccount={() => setOnboardingStep('age-gate')}
        onForgotPassword={() => setOnboardingStep('forgot-password')}
      />
    );
  }

  if (onboardingStep === 'forgot-password') {
    return (
      <ForgotPasswordForm
        onBack={() => setOnboardingStep('signin')}
      />
    );
  }

  if (onboardingStep === 'age-gate') {
    return (
      <AgeGate
        onContinue={() => setOnboardingStep('signup')}
      />
    );
  }

  if (onboardingStep === 'signup') {
    return (
      <SignUpForm
        onHaveAccount={() => setOnboardingStep('signin')}
      />
    );
  }

  return null;
};

export default Index;
