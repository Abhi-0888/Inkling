import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { moderationService, Report, Ban } from '@/services/moderationService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Ban as BanIcon, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingDown,
  Eye,
  Loader2,
  ArrowLeft,
  FileCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistance } from 'date-fns';
import { SkeletonCard } from '@/components/ui/skeleton-card';

interface VerificationUser {
  id: string;
  email: string;
  display_name?: string;
  verification_status: string;
  verification_submitted_at?: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isModerator, loading: authLoading } = useAdmin();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [verifications, setVerifications] = useState<VerificationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isModerator) {
      navigate('/');
    }
  }, [authLoading, isModerator, navigate]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'reports') {
        const data = await moderationService.getPendingReports();
        setReports(data);
      } else if (activeTab === 'bans') {
        const data = await moderationService.getActiveBans();
        setBans(data);
      } else if (activeTab === 'verifications') {
        const data = await moderationService.getPendingVerifications();
        setVerifications(data as VerificationUser[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error loading data',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolved' | 'dismissed') => {
    setProcessingId(reportId);
    try {
      const result = await moderationService.updateReportStatus(reportId, action);
      if (result.success) {
        toast({
          title: `Report ${action}`,
          description: `The report has been marked as ${action}.`,
        });
        setReports(reports.filter(r => r.id !== reportId));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerificationAction = async (userId: string, action: 'approve' | 'reject') => {
    setProcessingId(userId);
    try {
      const result = action === 'approve' 
        ? await moderationService.approveVerification(userId)
        : await moderationService.rejectVerification(userId);
      
      if (result.success) {
        toast({
          title: `Verification ${action === 'approve' ? 'approved' : 'rejected'}`,
          description: `The user has been ${action === 'approve' ? 'verified' : 'rejected'}.`,
        });
        setVerifications(verifications.filter(v => v.id !== userId));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevokeBan = async (banId: string) => {
    setProcessingId(banId);
    try {
      const result = await moderationService.revokeBan(banId);
      if (result.success) {
        toast({
          title: 'Ban revoked',
          description: 'The ban has been lifted.',
        });
        setBans(bans.filter(b => b.id !== banId));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isModerator) {
    return null;
  }

  const getReasonBadgeVariant = (reason: string) => {
    switch (reason) {
      case 'harassment':
        return 'destructive';
      case 'hate_abuse':
        return 'destructive';
      case 'sexual_content':
        return 'destructive';
      case 'spam':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
            </div>
            {isAdmin && (
              <Badge variant="default" className="bg-primary">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-xs text-muted-foreground">Pending Reports</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifications.length}</p>
                <p className="text-xs text-muted-foreground">Pending Verifications</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <BanIcon className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bans.length}</p>
                <p className="text-xs text-muted-foreground">Active Bans</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="verifications" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Verifications
            </TabsTrigger>
            <TabsTrigger value="bans" className="flex items-center gap-2">
              <BanIcon className="h-4 w-4" />
              Bans
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <SkeletonCard key={i} variant="simple" />)}
              </div>
            ) : reports.length === 0 ? (
              <Card className="border-0 shadow-sm bg-card/50">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium mb-1">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">No pending reports to review.</p>
                </CardContent>
              </Card>
            ) : (
              reports.map(report => (
                <Card key={report.id} className="border-0 shadow-sm bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getReasonBadgeVariant(report.reason) as any}>
                            {report.reason.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">{report.content_type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistance(new Date(report.created_at), new Date(), { addSuffix: true })}
                          </span>
                        </div>
                        {report.description && (
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Content ID: {report.content_id.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'dismissed')}
                          disabled={processingId === report.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReportAction(report.id, 'resolved')}
                          disabled={processingId === report.id}
                        >
                          {processingId === report.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <SkeletonCard key={i} variant="simple" />)}
              </div>
            ) : verifications.length === 0 ? (
              <Card className="border-0 shadow-sm bg-card/50">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium mb-1">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">No pending verifications.</p>
                </CardContent>
              </Card>
            ) : (
              verifications.map(user => (
                <Card key={user.id} className="border-0 shadow-sm bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.display_name || 'Anonymous'}</span>
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.verification_submitted_at && (
                          <p className="text-xs text-muted-foreground">
                            Submitted {formatDistance(new Date(user.verification_submitted_at), new Date(), { addSuffix: true })}
                          </p>
                        )}
                        {user.id_card_front_url && (
                          <div className="flex gap-2 mt-2">
                            <a 
                              href={user.id_card_front_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" /> View ID Front
                            </a>
                            {user.id_card_back_url && (
                              <a 
                                href={user.id_card_back_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" /> View ID Back
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() => handleVerificationAction(user.id, 'reject')}
                          disabled={processingId === user.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleVerificationAction(user.id, 'approve')}
                          disabled={processingId === user.id}
                        >
                          {processingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Bans Tab */}
          <TabsContent value="bans" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <SkeletonCard key={i} variant="simple" />)}
              </div>
            ) : bans.length === 0 ? (
              <Card className="border-0 shadow-sm bg-card/50">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-1">No active bans</h3>
                  <p className="text-sm text-muted-foreground">All users are in good standing.</p>
                </CardContent>
              </Card>
            ) : (
              bans.map(ban => (
                <Card key={ban.id} className="border-0 shadow-sm bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={ban.ban_type === 'permanent' ? 'destructive' : 'secondary'}
                          >
                            {ban.ban_type}
                          </Badge>
                          {ban.expires_at && (
                            <span className="text-xs text-muted-foreground">
                              Expires {formatDistance(new Date(ban.expires_at), new Date(), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{ban.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          User ID: {ban.user_id.slice(0, 8)}...
                        </p>
                      </div>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeBan(ban.id)}
                          disabled={processingId === ban.id}
                        >
                          {processingId === ban.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Revoke'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
