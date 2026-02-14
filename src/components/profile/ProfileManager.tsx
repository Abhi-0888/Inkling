import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield, CheckCircle, Clock, XCircle, LogOut, Key, Save, X, Mic, Camera, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { VoiceNoteRecorder } from '@/components/features/VoiceNoteRecorder';
import { isProfileComplete } from '@/utils/profileCompletionUtils';

interface ProfileManagerProps {
  onClose: () => void;
}

export const ProfileManager = ({ onClose }: ProfileManagerProps) => {
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [saving, setSaving] = useState(false);
  const [avatarColor, setAvatarColor] = useState('from-primary to-accent');
  const [promptQuestion, setPromptQuestion] = useState("My simple pleasure is...");
  const [promptAnswer, setPromptAnswer] = useState("");
  const [bio, setBio] = useState('');
  const [classOfYear, setClassOfYear] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [unpopularOpinion, setUnpopularOpinion] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const AVATAR_COLORS = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-red-500 to-orange-500',
  ];

  const PROMPTS = [
    "My simple pleasure is...",
    "I'm overly competitive about...",
    "My unpopular opinion is...",
    "Two truths and a lie...",
    "The way to my heart is...",
    "I bet you can't...",
  ];

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || '');
      const profileGender = userProfile.gender as 'male' | 'female' | 'other';
      if (profileGender && ['male', 'female', 'other'].includes(profileGender)) {
        setGender(profileGender);
      }
      setBio((userProfile as any).bio || '');
      setClassOfYear((userProfile as any).class_of_year?.toString() || '');
      setInterests((userProfile as any).interests || []);
      setUnpopularOpinion((userProfile as any).unpopular_opinion || '');

      // Load extra profile data from localStorage
      const savedExtras = localStorage.getItem(`user_profile_extras_${user?.id}`);
      if (savedExtras) {
        const { avatarColor, promptQuestion, promptAnswer } = JSON.parse(savedExtras);
        if (avatarColor) setAvatarColor(avatarColor);
        if (promptQuestion) setPromptQuestion(promptQuestion);
        if (promptAnswer) setPromptAnswer(promptAnswer);
      }
    }
  }, [userProfile, user?.id]);

  const handleSaveProfile = async () => {
    if (!user) return;

    // Check if profile was incomplete before saving
    const wasIncomplete = !isProfileComplete(userProfile);

    setSaving(true);
    try {
      const updateData: any = {
        display_name: displayName,
        gender,
        bio: bio || null,
        class_of_year: classOfYear ? parseInt(classOfYear) : null,
        interests: interests.length > 0 ? interests : null,
        unpopular_opinion: unpopularOpinion || null,
      };
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Save extra data to localStorage
      localStorage.setItem(`user_profile_extras_${user.id}`, JSON.stringify({
        avatarColor,
        promptQuestion,
        promptAnswer
      }));

      // Check if profile is now complete
      const isNowComplete = !!(
        bio && bio.trim().length > 0 &&
        classOfYear &&
        interests.length > 0
      );

      toast({
        title: wasIncomplete && isNowComplete ? "Profile complete! 🎉" : "Profile updated",
        description: wasIncomplete && isNowComplete
          ? "You can now access matching features."
          : "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getVerificationStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Verification Pending',
          color: 'bg-yellow-100 text-yellow-800',
          description: 'Please complete identity verification to access all features'
        };
      case 'under_review':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Under Review',
          color: 'bg-blue-100 text-blue-800',
          description: 'Your documents are being reviewed. This usually takes 24-48 hours.'
        };
      case 'verified':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Verified',
          color: 'bg-green-100 text-green-800',
          description: 'Your identity has been verified. You have full access to all features.'
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-4 w-4" />,
          label: 'Verification Failed',
          color: 'bg-red-100 text-red-800',
          description: 'Verification failed. Please resubmit your documents.'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Unknown Status',
          color: 'bg-gray-100 text-gray-800',
          description: 'Status unknown'
        };
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getVerificationStatusInfo(userProfile.verification_status || 'pending');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xs shadow-lg border-0 bg-card relative max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 z-10"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${avatarColor}`} />
            <User className="h-8 w-8 text-white relative z-10" />
          </div>
          <CardTitle className="text-xl font-bold">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5">
          {/* Profile Settings */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Profile Settings</h3>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Avatar Style</label>
              <div className="flex gap-2 flex-wrap justify-center p-2 bg-muted/20 rounded-lg">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setAvatarColor(color)}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} transition-transform hover:scale-110 focus:outline-none ring-2 ${avatarColor === color ? 'ring-primary ring-offset-2' : 'ring-transparent'}`}
                  />
                ))}
              </div>
            </div>

            {/* Current Vibe Display */}
            {userProfile.current_vibe && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Current Vibe</label>
                <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg">
                  <span className="text-xl">{(userProfile.current_vibe as any).icon}</span>
                  <span className="text-sm font-medium">{(userProfile.current_vibe as any).label}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Profile Prompt</label>
              <Select value={promptQuestion} onValueChange={setPromptQuestion}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMPTS.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={promptAnswer}
                onChange={(e) => setPromptAnswer(e.target.value)}
                placeholder="Your answer..."
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Gender</label>
              <Select value={gender} onValueChange={(value: 'male' | 'female' | 'other') => setGender(value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Class of Year</label>
              <Input
                value={classOfYear}
                onChange={(e) => setClassOfYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g. 2026"
                className="h-9"
                maxLength={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Bio / Description</label>
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Looking for meaningful connections…"
                className="h-9"
                maxLength={150}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Interests</label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {interests.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs gap-1 cursor-pointer" onClick={() => setInterests(interests.filter((_, j) => j !== i))}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Input
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && interestInput.trim() && interests.length < 8) {
                      e.preventDefault();
                      setInterests([...interests, interestInput.trim()]);
                      setInterestInput('');
                    }
                  }}
                  placeholder="Type & press Enter"
                  className="h-9 flex-1"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Max 8 interests. Click to remove.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Unpopular Opinion</label>
              <Input
                value={unpopularOpinion}
                onChange={(e) => setUnpopularOpinion(e.target.value)}
                placeholder="Pineapple belongs on pizza…"
                className="h-9"
                maxLength={120}
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full h-9"
              size="sm"
            >
              {saving ? <><User className="mr-2 h-3 w-3 animate-spin" /> Saving...</> : <><Save className="mr-2 h-3 w-3" /> Save Profile</>}
            </Button>
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Account Info</h3>
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>

              {userProfile?.full_name && (
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm font-medium">{userProfile.full_name}</p>
                </div>
              )}

              {userProfile?.phone_number && (
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{userProfile.phone_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Verification Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Verification</span>
              <Badge className={statusInfo.color}>
                <div className="flex items-center space-x-1">
                  {statusInfo.icon}
                  <span className="text-xs">{statusInfo.label}</span>
                </div>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {statusInfo.description}
            </p>
          </div>

          {/* Account Security */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-xs">Account Security</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Your account is protected and your identity {userProfile.verification_status === 'verified' ? 'is verified' : 'verification is in progress'}
                </p>
              </div>
            </div>
          </div>

          {/* Voice Intro Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Voice Introduction</h3>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <VoiceNoteRecorder compact />
            </div>
          </div>

          {/* Verification Badges */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Badges & Verification</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {userProfile.verification_status === 'verified' && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  ID Verified
                </Badge>
              )}
              {userProfile.photo_verified && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Camera className="h-3 w-3 mr-1" />
                  Photo Verified
                </Badge>
              )}
              {userProfile.voice_intro_url && (
                <Badge className="bg-purple-100 text-purple-800">
                  <Mic className="h-3 w-3 mr-1" />
                  Voice Intro
                </Badge>
              )}
            </div>
          </div>
          {showChangePassword ? (
            <div className="space-y-2">
              <h4 className="font-medium text-xs">Change Password</h4>
              <ChangePasswordForm
                onSuccess={() => {
                  setShowChangePassword(false);
                }}
                onCancel={() => setShowChangePassword(false)}
              />
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowChangePassword(true)}
              className="w-full h-9"
              size="sm"
            >
              <Key className="h-3 w-3 mr-2" />
              Change Password
            </Button>
          )}

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            disabled={loading}
            variant="destructive"
            className="w-full h-9"
            size="sm"
          >
            <LogOut className="h-3 w-3 mr-2" />
            {loading ? "Logging out..." : "Logout"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};