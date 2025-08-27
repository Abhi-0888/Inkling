import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Mail, Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase, Institute } from '@/lib/supabase';

interface CollegeVerificationProps {
  onVerificationComplete: (email: string, password: string, instituteId: string, gradYear: number) => void;
}

export const CollegeVerification = ({ onVerificationComplete }: CollegeVerificationProps) => {
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'id'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useState(() => {
    fetchInstitutes();
  });

  const fetchInstitutes = async () => {
    try {
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .eq('active', true);
      
      if (error) throw error;
      setInstitutes(data || []);
    } catch (error) {
      console.error('Error fetching institutes:', error);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getEmailDomain = (email: string) => {
    return email.split('@')[1]?.toLowerCase();
  };

  const findInstituteByEmail = (email: string) => {
    const domain = getEmailDomain(email);
    return institutes.find(institute => 
      institute.domain_patterns.some(pattern => 
        domain.includes(pattern.replace('*.', ''))
      )
    );
  };

  const handleEmailVerification = async () => {
    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    const institute = findInstituteByEmail(email);
    if (!institute) {
      toast({
        title: "Email not recognized",
        description: "We don't recognize this college email domain. Try ID verification instead.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would send an actual OTP
      // For now, we'll simulate it
      setOtpSent(true);
      setSelectedInstitute(institute.id);
      toast({
        title: "Verification code sent",
        description: `Check your email at ${email} for the verification code`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    if (!gradYear || parseInt(gradYear) < 2020 || parseInt(gradYear) > 2030) {
      toast({
        title: "Invalid graduation year",
        description: "Please select a valid graduation year",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would verify the OTP
      // For now, we'll simulate successful verification
      onVerificationComplete(email, password, selectedInstitute, parseInt(gradYear));
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">College Verification</CardTitle>
          <p className="text-muted-foreground">
            Verify your college affiliation to join your campus community
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={verificationMethod} onValueChange={(value) => setVerificationMethod(value as 'email' | 'id')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>College Email</span>
              </TabsTrigger>
              <TabsTrigger value="id" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Student ID</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">College Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleEmailVerification}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    {loading ? "Sending..." : "Send Verification Code"}
                  </Button>
                </>
              ) : (
                <>
                  <Alert className="border-primary/20 bg-primary/5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      Verification code sent to {email}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradYear">Expected Graduation Year</Label>
                    <Select value={gradYear} onValueChange={setGradYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleOtpVerification}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    {loading ? "Verifying..." : "Verify & Create Account"}
                  </Button>

                  <Button 
                    variant="ghost"
                    onClick={() => setOtpSent(false)}
                    className="w-full"
                  >
                    Back to email entry
                  </Button>
                </>
              )}
            </TabsContent>

            <TabsContent value="id" className="space-y-4">
              <Alert>
                <Upload className="h-4 w-4" />
                <AlertDescription>
                  Student ID verification coming soon! Use college email for now.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};