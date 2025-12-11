import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { testSessionsApi, type TestSessionDetail } from '@/services/api';
import { toast } from 'sonner';

const TestSessionListPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TestSessionDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await testSessionsApi.getAll();
      setSessions(response.sessions);
    } catch (error) {
      toast.error('Failed to load test sessions', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusDisplay = (status: TestSessionDetail['status']): string => {
    const statusMap: Record<string, string> = {
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
      in_progress: 'In Progress',
      expired: 'Expired',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: TestSessionDetail['status']): string => {
    const colorMap: Record<string, string> = {
      active: 'text-green-600 dark:text-green-400',
      completed: 'text-blue-600 dark:text-blue-400',
      cancelled: 'text-gray-600 dark:text-gray-400',
      in_progress: 'text-yellow-600 dark:text-yellow-400',
      expired: 'text-red-600 dark:text-red-400',
    };
    return colorMap[status] || 'text-muted-foreground';
  };

  const handleViewReport = (sessionId: string) => {
    // TODO: Navigate to test session report page when implemented
    navigate(`/test-sessions/${sessionId}/report`);
  };

  const handleViewSummary = (sessionId: string) => {
    // For active sessions, navigate to summary/report page
    navigate(`/test-sessions/${sessionId}/report`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading test sessions...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold">Test Sessions List</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all your test sessions
          </p>
        </div>

        {/* Sessions Table */}
        {sessions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Test Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No test sessions yet. Launch a new test session to get started!
              </p>
              <Button onClick={() => navigate('/launch-test')}>
                Launch Test Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Test Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Time Limit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {session.templateName || 'Unknown Template'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatDate(session.createdAt)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(session.createdAt).split(',')[1]?.trim()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{session.participantCount ?? 0}</TableCell>
                        <TableCell>{session.timeLimitMinutes} min</TableCell>
                        <TableCell>
                          <span className={getStatusColor(session.status)}>
                            {getStatusDisplay(session.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {session.status === 'active' || session.status === 'completed' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReport(session.id)}
                            >
                              View Report
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewSummary(session.id)}
                            >
                              View Summary
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TestSessionListPage;

