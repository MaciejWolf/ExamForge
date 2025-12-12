import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { ArrowLeft, CheckCircle2, Clock, Circle } from 'lucide-react';
import { testSessionsApi, type TestSessionReport, type Participant } from '@/services/api';
import { toast } from 'sonner';

type SortField = 'name' | 'score' | 'percentage' | 'status';
type SortDirection = 'asc' | 'desc';

const TestSessionReportPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [report, setReport] = useState<TestSessionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    if (sessionId) {
      fetchReport();
    }
  }, [sessionId]);

  const fetchReport = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const data = await testSessionsApi.getReport(sessionId);
      setReport(data);
    } catch (error) {
      toast.error('Failed to load test session report', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      navigate('/test-sessions');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: Participant['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'not_started':
        return <Circle className="h-5 w-5 text-gray-400" />;
      case 'timed_out':
        return <Clock className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: Participant['status']): string => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
        return 'Not Started';
      case 'timed_out':
        return 'Timed Out';
      default:
        return status;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedParticipants = report?.participants ? [...report.participants].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = a.identifier.toLowerCase();
        bValue = b.identifier.toLowerCase();
        break;
      case 'score':
        aValue = a.totalScore ?? -1;
        bValue = b.totalScore ?? -1;
        break;
      case 'percentage':
        const aMax = a.maxScore ?? 1;
        const bMax = b.maxScore ?? 1;
        aValue = a.totalScore !== undefined ? (a.totalScore / aMax) * 100 : -1;
        bValue = b.totalScore !== undefined ? (b.totalScore / bMax) * 100 : -1;
        break;
      case 'status':
        const statusOrder = { completed: 1, in_progress: 2, not_started: 3, timed_out: 4 };
        aValue = statusOrder[a.status] ?? 5;
        bValue = statusOrder[b.status] ?? 5;
        break;
      default:
        return 0;
    }

    // Put no-score participants at bottom when sorting by score/percentage
    if (sortField === 'score' || sortField === 'percentage') {
      if (aValue === -1 && bValue !== -1) return 1;
      if (aValue !== -1 && bValue === -1) return -1;
      if (aValue === -1 && bValue === -1) return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  }) : [];

  const getQuestionPerformanceColor = (percentage: number): string => {
    if (percentage >= 75) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleParticipantClick = (participant: Participant) => {
    if (participant.status !== 'not_started') {
      navigate(`/test-sessions/${sessionId}/participants/${participant.id}`);
    }
  };

  const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
      in_progress: 'In Progress',
      expired: 'Expired',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading test results...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No report data available</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/test-sessions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sessions
        </Button>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold">Test Session Report</h1>
        </div>

        {/* Session Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Template</p>
                <p className="text-base">{report.session.templateName || 'Unknown Template'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Launched</p>
                <p className="text-base">{formatDateTime(report.session.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Limit</p>
                <p className="text-base">{report.session.timeLimitMinutes} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-base">{getStatusDisplay(report.session.status)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Participants</p>
                <p className="text-base">
                  {report.statistics.totalParticipants} total
                  {' - '}
                  <span className="text-green-600">{report.statistics.completedCount} completed</span>
                  {report.statistics.inProgressCount > 0 && (
                    <>
                      {' - '}
                      <span className="text-yellow-600">{report.statistics.inProgressCount} in progress</span>
                    </>
                  )}
                  {report.statistics.notStartedCount > 0 && (
                    <>
                      {' - '}
                      <span className="text-gray-600">{report.statistics.notStartedCount} not started</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Participants Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedParticipants.length === 0 ? (
              <p className="text-muted-foreground">No participants found</p>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          onClick={() => handleSort('name')}
                          className="hover:text-foreground flex items-center gap-1"
                        >
                          Participant
                          {sortField === 'name' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('score')}
                          className="hover:text-foreground flex items-center gap-1"
                        >
                          Score
                          {sortField === 'score' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('percentage')}
                          className="hover:text-foreground flex items-center gap-1"
                        >
                          Percentage
                          {sortField === 'percentage' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('status')}
                          className="hover:text-foreground flex items-center gap-1"
                        >
                          Status
                          {sortField === 'status' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedParticipants.map((participant) => {
                      const maxScore = participant.maxScore ?? 1;
                      const score = participant.totalScore ?? 0;
                      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                      const isClickable = participant.status !== 'not_started';

                      return (
                        <TableRow
                          key={participant.id}
                          onClick={() => handleParticipantClick(participant)}
                          className={isClickable ? 'cursor-pointer hover:bg-muted/50' : ''}
                        >
                          <TableCell className="font-medium">{participant.identifier}</TableCell>
                          <TableCell>
                            {participant.totalScore !== undefined && participant.maxScore !== undefined
                              ? `${participant.totalScore}/${participant.maxScore}`
                              : '-/' + (participant.maxScore ?? '?')}
                          </TableCell>
                          <TableCell>
                            {participant.totalScore !== undefined && participant.maxScore !== undefined
                              ? `${percentage}%`
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(participant.status)}
                              <span>{getStatusText(participant.status)}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Aggregate Statistics */}
            {report.statistics.completedCount > 0 && (() => {
              const maxScore = report.questionAnalysis.reduce((sum, q) => sum + q.points, 0);
              const participantWithScore = report.participants.find((p) => p.maxScore !== undefined);
              const actualMaxScore = participantWithScore?.maxScore ?? maxScore;
              
              return (
                <div className="mt-6 space-y-2">
                  <h3 className="text-lg font-semibold">Summary Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                      <p className="text-xl font-semibold">
                        {Math.round(report.statistics.averageScore)}/{actualMaxScore} (
                        {actualMaxScore > 0
                          ? Math.round((report.statistics.averageScore / actualMaxScore) * 100)
                          : 0}
                        %)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Highest Score</p>
                      <p className="text-xl font-semibold">
                        {report.statistics.highestScore}/{actualMaxScore} (
                        {actualMaxScore > 0
                          ? Math.round((report.statistics.highestScore / actualMaxScore) * 100)
                          : 0}
                        %)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Lowest Score</p>
                      <p className="text-xl font-semibold">
                        {report.statistics.lowestScore}/{actualMaxScore} (
                        {actualMaxScore > 0
                          ? Math.round((report.statistics.lowestScore / actualMaxScore) * 100)
                          : 0}
                        %)
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Question Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Question Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {report.questionAnalysis.length === 0 ? (
              <p className="text-muted-foreground">No question analysis available</p>
            ) : (
              <div className="space-y-4">
                {report.questionAnalysis.map((question) => (
                  <Card key={question.questionId}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Q{question.questionNumber}. {question.questionContent}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Correct Answer</p>
                          <p className="text-base">{question.correctAnswer}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Points</p>
                          <p className="text-base">{question.points}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Correct Responses</p>
                          <p className="text-base">
                            {question.correctResponses}/{question.totalResponses} (
                            {question.totalResponses > 0
                              ? Math.round((question.correctResponses / question.totalResponses) * 100)
                              : 0}
                            %)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Performance</p>
                          <p
                            className={`text-base font-semibold ${getQuestionPerformanceColor(
                              question.correctPercentage
                            )}`}
                          >
                            {question.correctPercentage.toFixed(1)}% correct
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
};

export default TestSessionReportPage;

