import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SparkOfDayCard } from '@/components/features/SparkOfDayCard';
import { CampusEvents } from '@/components/features/CampusEvents';
import { CompatibilityQuiz } from '@/components/features/CompatibilityQuiz';
import { CampusPolls } from '@/components/features/CampusPolls';
import { SecretAdmirers } from '@/components/features/SecretAdmirers';
import { PhotoVerificationCard } from '@/components/features/PhotoVerificationCard';
import { VoiceNoteRecorder } from '@/components/features/VoiceNoteRecorder';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Calendar, Brain, BarChart3, Heart, Camera, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiscoverProps {
  onShowProfile?: () => void;
}

export const Discover = ({ onShowProfile }: DiscoverProps) => {
  const [activeSection, setActiveSection] = useState('spark');

  const sections = [
    { id: 'spark', label: 'Spark', icon: Sparkles },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'quiz', label: 'Quiz', icon: Brain },
    { id: 'polls', label: 'Polls', icon: BarChart3 },
    { id: 'admirers', label: 'Admirers', icon: Heart },
    { id: 'verify', label: 'Verify', icon: Camera },
    { id: 'voice', label: 'Voice', icon: Mic },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Section Tabs */}
      <div className="sticky top-14 bg-background/80 backdrop-blur-md z-40 border-b border-border">
        <ScrollArea className="w-full">
          <div className="flex gap-1 p-2 min-w-max">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeSection === id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === 'spark' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ✨ Spark of the Day
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your daily match based on compatibility
                  </p>
                </div>
                <SparkOfDayCard />
              </div>
            )}

            {activeSection === 'events' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    📅 Campus Events
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect with others at campus events
                  </p>
                </div>
                <CampusEvents />
              </div>
            )}

            {activeSection === 'quiz' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    🧠 Compatibility Quiz
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Discover your personality type
                  </p>
                </div>
                <CompatibilityQuiz />
              </div>
            )}

            {activeSection === 'polls' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    📊 Campus Polls
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vote on trending topics
                  </p>
                </div>
                <CampusPolls />
              </div>
            )}

            {activeSection === 'admirers' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    💕 Secret Admirers
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    See who's interested in you
                  </p>
                </div>
                <SecretAdmirers />
              </div>
            )}

            {activeSection === 'verify' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    📸 Photo Verification
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get verified and earn trust
                  </p>
                </div>
                <PhotoVerificationCard />
              </div>
            )}

            {activeSection === 'voice' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    🎙️ Voice Intro
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Let your voice be heard
                  </p>
                </div>
                <VoiceNoteRecorder />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
