import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield, CheckCircle, Clock, XCircle, LogOut, Key, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

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

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || '');
      const profileGender = userProfile.gender as 'male' | 'female' | 'other';
      if (profileGender && ['male', 'female', 'other'].includes(profileGender)) {
        setGender(profileGender);
      }
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ display_name: displayName, gender })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
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
      <Card className="w-full max-w-md shadow-lg border-0 bg-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl font-bold">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Gender</label>
              <Select value={gender} onValueChange={(value: 'male' | 'female' | 'other') => setGender(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={saving}
              className="w-full"
            >
              {saving ? <><User className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Profile</>}
            </Button>
          </div>

          {/* User Info */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            
            {userProfile?.full_name && (
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{userProfile.full_name}</p>
              </div>
            )}

            {userProfile?.phone_number && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{userProfile.phone_number}</p>
              </div>
            )}
          </div>

          {/* Verification Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verification Status</span>
              <Badge className={statusInfo.color}>
                <div className="flex items-center space-x-1">
                  {statusInfo.icon}
                  <span>{statusInfo.label}</span>
                </div>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {statusInfo.description}
            </p>
          </div>

          {/* Account Stats */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Account Security</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Your account is protected and your identity {userProfile.verification_status === 'verified' ? 'is verified' : 'verification is in progress'}
                </p>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          {showChangePassword ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Change Password</h4>
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
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button 
              onClick={handleLogout}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {loading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};