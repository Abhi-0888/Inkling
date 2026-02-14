import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { submitPhotoVerification, getPhotoVerificationStatus, PhotoVerification } from '@/services/photoVerificationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const PhotoVerificationCard = () => {
  const { user, userProfile } = useAuth();
  const [verification, setVerification] = useState<PhotoVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadVerificationStatus();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  const loadVerificationStatus = async () => {
    setLoading(true);
    const status = await getPhotoVerificationStatus();
    setVerification(status);
    setLoading(false);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 480 }
      });
      setStream(mediaStream);
      setCapturing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      toast.error('Could not access camera');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturing(false);
  };

  const captureAndSubmit = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Mirror the image for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      stopCamera();
      setUploading(true);
      
      const result = await submitPhotoVerification(blob);
      setUploading(false);
      
      if (result) {
        toast.success('Verification submitted! We\'ll review it soon.');
        setVerification(result);
      } else {
        toast.error('Failed to submit verification');
      }
    }, 'image/jpeg', 0.9);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6 h-32" />
      </Card>
    );
  }

  // Already verified
  if (userProfile?.photo_verified) {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-green-600">Photo Verified</h3>
            <p className="text-sm text-muted-foreground">
              Your profile has a verified badge!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending verification
  if (verification?.status === 'pending') {
    return (
      <Card className="bg-yellow-500/10 border-yellow-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-yellow-600 animate-spin" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-600">Under Review</h3>
            <p className="text-sm text-muted-foreground">
              We're reviewing your photo verification.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Rejected verification
  if (verification?.status === 'rejected') {
    return (
      <Card className="bg-red-500/10 border-red-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-red-600">Verification Rejected</h3>
              <p className="text-sm text-muted-foreground">
                {verification.rejection_reason || 'Please try again with a clearer photo.'}
              </p>
            </div>
          </div>
          <Button onClick={startCamera} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Camera capture mode
  if (capturing) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-square object-cover rounded-lg"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Face guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-64 border-2 border-dashed border-white/50 rounded-full" />
            </div>
          </div>
          
          <p className="text-sm text-center text-muted-foreground mb-4">
            Position your face within the oval
          </p>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={stopCamera} className="flex-1">
              Cancel
            </Button>
            <Button onClick={captureAndSubmit} className="flex-1" disabled={uploading}>
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: prompt to verify
  return (
    <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Get Verified</h3>
            <p className="text-sm text-muted-foreground">
              Earn a verified badge on your profile!
            </p>
          </div>
        </div>
        
        <ul className="text-sm text-muted-foreground space-y-1 mb-4">
          <li>✓ Increase trust with matches</li>
          <li>✓ Stand out in search results</li>
          <li>✓ Show you're a real person</li>
        </ul>
        
        <Button onClick={startCamera} className="w-full">
          <Camera className="h-4 w-4 mr-2" />
          Take Verification Selfie
        </Button>
      </CardContent>
    </Card>
  );
};
