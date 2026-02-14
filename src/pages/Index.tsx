import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/pages/LandingPage';
import { AgeGate } from '@/components/auth/AgeGate';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SignInForm } from '@/components/SignInForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Feed } from '@/components/feed/Feed';
import { DarkDesire } from '@/components/sections/DarkDesire';
import { BlindDate } from '@/components/sections/BlindDate';
import { Matching } from '@/components/sections/Matching';
import { Chatting } from '@/components/sections/Chatting';
import { BottomNav } from '@/components/layout/BottomNav';
import { AppHeader } from '@/components/layout/AppHeader';
import { ProfileManager } from '@/components/profile/ProfileManager';
import { IdentityVerificationForm } from '@/components/auth/IdentityVerificationForm';

const Index = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const [onboardingStep, setOnboardingStep] = useState<'landing' | 'signin' | 'age-gate' | 'signup' | 'forgot-password'>('landing');
  const [activeTab, setActiveTab] = useState('feed');
  const [showProfile, setShowProfile] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show main app
  if (user) {
    // Check if user needs to complete verification
    if (userProfile?.verification_status === 'pending' && !showVerification) {
      return (
        <div className="min-h-screen bg-background">
          <IdentityVerificationForm 
            onVerificationSubmitted={() => setShowVerification(false)}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <AppHeader onShowProfile={() => setShowProfile(true)} />
        <div className="pt-14">
          {activeTab === 'feed' && <Feed onPostClick={() => {}} onShowProfile={() => setShowProfile(true)} />}
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
