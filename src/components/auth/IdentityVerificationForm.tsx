import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface IdentityVerificationFormProps {
  onVerificationSubmitted: () => void;
}

export const IdentityVerificationForm = ({ onVerificationSubmitted }: IdentityVerificationFormProps) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (type: 'front' | 'back', file: File | null) => {
    if (type === 'front') {
      setIdCardFront(file);
    } else {
      setIdCardBack(file);
    }
  };

  const uploadFile = async (file: File, fileName: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('id-cards')
      .upload(`${user?.id}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !phoneNumber || !dateOfBirth || !address || !idCardFront || !idCardBack) {
      toast({
        title: "All fields required",
        description: "Please fill in all information and upload both ID card images",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      // Upload ID card images
      const frontPath = await uploadFile(idCardFront, `id-front-${Date.now()}.${idCardFront.name.split('.').pop()}`);
      const backPath = await uploadFile(idCardBack, `id-back-${Date.now()}.${idCardBack.name.split('.').pop()}`);

      // Update user profile with verification info
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          date_of_birth: dateOfBirth,
          address: address,
          id_card_front_url: frontPath,
          id_card_back_url: backPath,
          verification_status: 'under_review',
          verification_submitted_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Send verification email
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: user.email,
          fullName: fullName
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't throw error here, as the main verification is still successful
      }

      toast({
        title: "Verification submitted!",
        description: "Your identity documents have been submitted for review. Check your email for details.",
      });

      onVerificationSubmitted();
    } catch (error: any) {
      console.error('Verification submission error:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Identity Verification
          </CardTitle>
          <p className="text-muted-foreground">
            Complete your identity verification to access all features
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter your full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID Card Front</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('front', e.target.files?.[0] || null)}
                    className="hidden"
                    id="idCardFront"
                    required
                  />
                  <label htmlFor="idCardFront" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {idCardFront ? idCardFront.name : "Click to upload front"}
                    </p>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ID Card Back</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('back', e.target.files?.[0] || null)}
                    className="hidden"
                    id="idCardBack"
                    required
                  />
                  <label htmlFor="idCardBack" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {idCardBack ? idCardBack.name : "Click to upload back"}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Privacy & Security</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your documents are encrypted and only used for verification. We follow strict privacy guidelines.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {loading ? "Submitting verification..." : "Submit for Verification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};