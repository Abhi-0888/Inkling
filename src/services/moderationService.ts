import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Validation schemas
const reportSchema = z.object({
  content_id: z.string().uuid(),
  content_type: z.enum(['post', 'comment', 'chat', 'user']),
  reason: z.enum(['harassment', 'hate_abuse', 'sexual_content', 'spam', 'other']),
  description: z.string().max(500).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

export interface Report {
  id: string;
  reporter_id: string;
  content_id: string;
  content_type: 'post' | 'comment' | 'chat' | 'user';
  reason: 'harassment' | 'hate_abuse' | 'sexual_content' | 'spam' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  action_taken?: string;
  created_at: string;
}

export interface Ban {
  id: string;
  user_id: string;
  ban_type: 'shadow' | 'temporary' | 'permanent';
  reason: string;
  issued_by?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserStrike {
  id: string;
  user_id: string;
  report_id?: string;
  reason: string;
  issued_by?: string;
  created_at: string;
}

export interface TrustScore {
  id: string;
  user_id: string;
  score: number;
  total_likes_received: number;
  total_reports_against: number;
  total_blocks_received: number;
  positive_interactions: number;
  updated_at: string;
}

// Banned keywords for auto-flagging
const BANNED_KEYWORDS = [
  'kill', 'murder', 'suicide', 'rape', 'die',
  // Add more as needed
];

export const moderationService = {
  // Submit a report
  async submitReport(input: ReportInput): Promise<{ success: boolean; error?: string }> {
    try {
      const validated = reportSchema.parse(input);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          content_id: validated.content_id,
          content_type: validated.content_type,
          reason: validated.reason,
          description: validated.description,
        });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error submitting report:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if content contains banned keywords
  checkForBannedContent(content: string): { flagged: boolean; reasons: string[] } {
    const lowerContent = content.toLowerCase();
    const flaggedKeywords = BANNED_KEYWORDS.filter(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );
    
    return {
      flagged: flaggedKeywords.length > 0,
      reasons: flaggedKeywords.map(k => `Contains banned keyword: ${k}`)
    };
  },

  // Get user's own reports
  async getMyReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Report[];
  },

  // Admin: Get all pending reports
  async getPendingReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Report[];
  },

  // Admin: Get all reports with filters
  async getAllReports(status?: string): Promise<Report[]> {
    let query = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Report[];
  },

  // Admin: Update report status
  async updateReportStatus(
    reportId: string, 
    status: 'reviewed' | 'resolved' | 'dismissed',
    actionTaken?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reports')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          action_taken: actionTaken,
        })
        .eq('id', reportId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Admin: Issue a ban
  async issueBan(
    userId: string,
    banType: 'shadow' | 'temporary' | 'permanent',
    reason: string,
    expiresAt?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bans')
        .insert({
          user_id: userId,
          ban_type: banType,
          reason,
          issued_by: user.id,
          expires_at: expiresAt,
        });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Admin: Revoke a ban
  async revokeBan(banId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('bans')
        .update({ is_active: false })
        .eq('id', banId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Admin: Get all active bans
  async getActiveBans(): Promise<Ban[]> {
    const { data, error } = await supabase
      .from('bans')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Ban[];
  },

  // Admin: Issue a strike
  async issueStrike(
    userId: string,
    reason: string,
    reportId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_strikes')
        .insert({
          user_id: userId,
          reason,
          report_id: reportId,
          issued_by: user.id,
        });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Admin: Get strikes for a user
  async getUserStrikes(userId: string): Promise<UserStrike[]> {
    const { data, error } = await supabase
      .from('user_strikes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as UserStrike[];
  },

  // Admin: Get trust scores
  async getTrustScores(): Promise<TrustScore[]> {
    const { data, error } = await supabase
      .from('trust_scores')
      .select('*')
      .order('score', { ascending: true });

    if (error) throw error;
    return (data || []) as TrustScore[];
  },

  // Admin: Get pending verifications
  async getPendingVerifications() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_status', 'submitted')
      .order('verification_submitted_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Admin: Approve verification
  async approveVerification(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          verification_status: 'verified',
          verification_completed_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Admin: Reject verification
  async rejectVerification(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          verification_status: 'rejected',
          verification_completed_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Check if current user is admin/moderator
  async checkModeratorAccess(): Promise<{ isAdmin: boolean; isModerator: boolean }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isAdmin: false, isModerator: false };

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const roles = data?.map(r => r.role) || [];
      return {
        isAdmin: roles.includes('admin'),
        isModerator: roles.includes('moderator') || roles.includes('admin'),
      };
    } catch {
      return { isAdmin: false, isModerator: false };
    }
  },
};
