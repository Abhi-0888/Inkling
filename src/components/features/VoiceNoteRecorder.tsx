import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Play, Pause, Trash2, Upload } from 'lucide-react';
import { uploadVoiceIntro, deleteVoiceIntro } from '@/services/voiceNoteService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VoiceNoteRecorderProps {
  existingUrl?: string | null;
  onUpdate?: () => void;
  compact?: boolean;
}

export const VoiceNoteRecorder = ({ existingUrl, onUpdate, compact = false }: VoiceNoteRecorderProps) => {
  const { userProfile } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (userProfile?.voice_intro_url) {
      setAudioUrl(userProfile.voice_intro_url);
    }
  }, [userProfile]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      toast.error('Could not access microphone');
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(audioUrl);
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) return;

    setUploading(true);
    const url = await uploadVoiceIntro(audioBlob);
    setUploading(false);

    if (url) {
      toast.success('Voice intro uploaded!');
      setAudioUrl(url);
      setAudioBlob(null);
      onUpdate?.();
    } else {
      toast.error('Failed to upload');
    }
  };

  const handleDelete = async () => {
    const success = await deleteVoiceIntro();
    if (success) {
      toast.success('Voice intro deleted');
      setAudioUrl(null);
      setAudioBlob(null);
      onUpdate?.();
    } else {
      toast.error('Failed to delete');
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    if (audioUrl && !existingUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(existingUrl || null);
    } else {
      setAudioUrl(existingUrl || null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Record a 30-second voice intro
        </p>
        
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {isRecording ? (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-xs">{formatTime(recordingTime)}</span>
              </div>
              <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={stopRecording}>
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
            </>
          ) : audioUrl ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={isPlaying ? pauseAudio : playAudio}
              >
                {isPlaying ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              {audioBlob ? (
                <>
                  <Button size="sm" className="h-7 text-xs" onClick={handleUpload} disabled={uploading}>
                    <Upload className="h-3 w-3 mr-1" />
                    {uploading ? '...' : 'Save'}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={discardRecording}>
                    Discard
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </>
          ) : (
            <Button onClick={startRecording} size="sm" className="h-7 text-xs">
              <Mic className="h-3 w-3 mr-1" />
              Record
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Mic className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Voice Introduction</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Record a 30-second voice intro to let others hear your vibe!
        </p>

        {/* Recording UI */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {isRecording ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono">{formatTime(recordingTime)}</span>
                <span className="text-muted-foreground text-sm">/ 0:30</span>
              </div>
              <Button variant="destructive" size="sm" onClick={stopRecording}>
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </>
          ) : audioUrl ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isPlaying ? pauseAudio : playAudio}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-1" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              {audioBlob && (
                <>
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {uploading ? 'Uploading...' : 'Save'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={discardRecording}
                  >
                    Discard
                  </Button>
                </>
              )}
              
              {!audioBlob && audioUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <Button onClick={startRecording} className="gap-2">
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          )}
        </div>

        {/* Waveform visualization placeholder */}
        {(isRecording || audioUrl) && (
          <div className="h-12 bg-muted rounded-lg flex items-center justify-center gap-1 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-primary rounded-full transition-all duration-150 ${
                  isRecording ? 'animate-pulse' : ''
                }`}
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                  opacity: isRecording ? 1 : 0.5
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
