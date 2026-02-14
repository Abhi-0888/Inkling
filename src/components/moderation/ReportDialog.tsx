import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { moderationService, ReportInput } from '@/services/moderationService';
import { useToast } from '@/hooks/use-toast';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'post' | 'comment' | 'chat' | 'user';
}

const REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment', description: 'Bullying, threats, or intimidation' },
  { value: 'hate_abuse', label: 'Hate / Abuse', description: 'Hate speech, discrimination, or abuse' },
  { value: 'sexual_content', label: 'Sexual Content', description: 'Inappropriate sexual content' },
  { value: 'spam', label: 'Spam', description: 'Spam, scams, or misleading content' },
  { value: 'other', label: 'Other', description: 'Other policy violation' },
] as const;

export const ReportDialog = ({ isOpen, onClose, contentId, contentType }: ReportDialogProps) => {
  const [reason, setReason] = useState<ReportInput['reason'] | ''>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: 'Please select a reason',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await moderationService.submitReport({
        content_id: contentId,
        content_type: contentType,
        reason,
        description: description.trim() || undefined,
      });

      if (result.success) {
        toast({
          title: 'Report submitted',
          description: 'Thank you for helping keep Inkling safe.',
        });
        onClose();
        setReason('');
        setDescription('');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to submit report',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Help us understand what's wrong with this {contentType}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportInput['reason'])}>
            {REPORT_REASONS.map((r) => (
              <div
                key={r.value}
                className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setReason(r.value)}
              >
                <RadioGroupItem value={r.value} id={r.value} className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor={r.value} className="font-medium cursor-pointer">
                    {r.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide more context about this report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
