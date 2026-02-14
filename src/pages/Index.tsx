import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/pages/LandingPage';
import { AgeGate } from '@/components/auth/AgeGate';
import { CollegeVerification } from '@/components/auth/CollegeVerification';
import { SignInForm } from '@/components/SignInForm';
import { Feed } from '@/components/feed/Feed';
import { DarkDesire } from '@/components/sections/DarkDesire';
import { BlindDate } from '@/components/sections/BlindDate';
import { Matching } from '@/components/sections/Matching';
import { Chatting } from '@/components/sections/Chatting';
import { BottomNav } from '@/components/layout/BottomNav';

const Index = () => {
  const { user, userProfile, loading, signUp } = useAuth();
  const [onboardingStep, setOnboardingStep] = useState<'landing' | 'signin' | 'age-gate' | 'verification'>('landing');
  const [activeTab, setActiveTab] = useState('feed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show main app
  if (user && userProfile) {
    return (
      <div className="min-h-screen bg-background">
        {activeTab === 'feed' && <Feed onPostClick={() => {}} />}
        {activeTab === 'dark-desire' && <DarkDesire />}
        {activeTab === 'blind-date' && <BlindDate />}
        {activeTab === 'matching' && <Matching />}
        {activeTab === 'chatting' && <Chatting />}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
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
      />
    );
  }

  if (onboardingStep === 'age-gate') {
    return (
      <AgeGate
        onContinue={() => setOnboardingStep('verification')}
      />
    );
  }

  if (onboardingStep === 'verification') {
    return (
      <CollegeVerification
        onVerificationComplete={async (email, password, instituteId, gradYear) => {
          try {
            await signUp(email, password, instituteId, gradYear);
          } catch (error) {
            console.error('Signup error:', error);
          }
        }}
      />
    );
  }

  return null;
};

export default Index;
