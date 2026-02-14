import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/pages/LandingPage';
import { AgeGate } from '@/components/auth/AgeGate';
import { CollegeVerification } from '@/components/auth/CollegeVerification';
import { SignInForm } from '@/components/SignInForm';
import { Feed } from '@/components/feed/Feed';
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
        {activeTab === 'vibes' && (
          <div className="flex-1 flex items-center justify-center pb-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Vibes</h2>
              <p className="text-muted-foreground">Secret likes and matches coming soon!</p>
            </div>
          </div>
        )}
        {activeTab === 'matches' && (
          <div className="flex-1 flex items-center justify-center pb-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Matches</h2>
              <p className="text-muted-foreground">Your private chats will appear here!</p>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="flex-1 flex items-center justify-center pb-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-muted-foreground">Account settings coming soon!</p>
            </div>
          </div>
        )}
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
