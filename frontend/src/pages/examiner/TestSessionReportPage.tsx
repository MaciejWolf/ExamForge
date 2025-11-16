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
import { ParticipantDetailModal } from '@/components/ParticipantDetailModal';

type SortField = 'name' | 'score' | 'percentage' | 'status';
type SortDirection = 'asc' | 'desc';

const TestSessionReportPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [report, setReport] = useState<TestSessionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        aValue = a.total_score ?? -1;
        bValue = b.total_score ?? -1;
        break;
      case 'percentage':
        const aMax = a.max_score ?? 1;
        const bMax = b.max_score ?? 1;
        aValue = a.total_score !== undefined ? (a.total_score / aMax) * 100 : -1;
        bValue = b.total_score !== undefined ? (b.total_score / bMax) * 100 : -1;
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
      setSelectedParticipantId(participant.id);
      setIsModalOpen(true);
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
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
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
                <p className="text-base">{report.session.template_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Launched</p>
                <p className="text-base">{formatDateTime(report.session.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Limit</p>
                <p className="text-base">{report.session.time_limit_minutes} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-base">{getStatusDisplay(report.session.status)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Participants</p>
                <p className="text-base">
                  {report.statistics.total_participants} total
                  {' - '}
                  <span className="text-green-600">{report.statistics.completed_count} completed</span>
                  {report.statistics.in_progress_count > 0 && (
                    <>
                      {' - '}
                      <span className="text-yellow-600">{report.statistics.in_progress_count} in progress</span>
                    </>
                  )}
                  {report.statistics.not_started_count > 0 && (
                    <>
                      {' - '}
                      <span className="text-gray-600">{report.statistics.not_started_count} not started</span>
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
                      const maxScore = participant.max_score ?? 1;
                      const score = participant.total_score ?? 0;
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
                            {participant.total_score !== undefined && participant.max_score !== undefined
                              ? `${participant.total_score}/${participant.max_score}`
                              : '-/' + (participant.max_score ?? '?')}
                          </TableCell>
                          <TableCell>
                            {participant.total_score !== undefined && participant.max_score !== undefined
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
            {report.statistics.completed_count > 0 && (() => {
              const maxScore = report.questionAnalysis.reduce((sum, q) => sum + q.points, 0);
              const participantWithScore = report.participants.find((p) => p.max_score !== undefined);
              const actualMaxScore = participantWithScore?.max_score ?? maxScore;
              
              return (
                <div className="mt-6 space-y-2">
                  <h3 className="text-lg font-semibold">Summary Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                      <p className="text-xl font-semibold">
                        {Math.round(report.statistics.average_score)}/{actualMaxScore} (
                        {actualMaxScore > 0
                          ? Math.round((report.statistics.average_score / actualMaxScore) * 100)
                          : 0}
                        %)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Highest Score</p>
                      <p className="text-xl font-semibold">
                        {report.statistics.highest_score}/{actualMaxScore} (
                        {actualMaxScore > 0
                          ? Math.round((report.statistics.highest_score / actualMaxScore) * 100)
                          : 0}
                        %)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Lowest Score</p>
                      <p className="text-xl font-semibold">
                        {report.statistics.lowest_score}/{actualMaxScore} (
                        {actualMaxScore > 0
                          ? Math.round((report.statistics.lowest_score / actualMaxScore) * 100)
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
                  <Card key={question.question_id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Q{question.question_number}. {question.question_content}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Correct Answer</p>
                          <p className="text-base">{question.correct_answer}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Points</p>
                          <p className="text-base">{question.points}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Correct Responses</p>
                          <p className="text-base">
                            {question.correct_responses}/{question.total_responses} (
                            {question.total_responses > 0
                              ? Math.round((question.correct_responses / question.total_responses) * 100)
                              : 0}
                            %)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Performance</p>
                          <p
                            className={`text-base font-semibold ${getQuestionPerformanceColor(
                              question.correct_percentage
                            )}`}
                          >
                            {question.correct_percentage.toFixed(1)}% correct
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

      {/* Participant Detail Modal */}
      {sessionId && (
        <ParticipantDetailModal
          sessionId={sessionId}
          participantId={selectedParticipantId}
          timeLimitMinutes={report.session.time_limit_minutes}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </DashboardLayout>
  );
};

export default TestSessionReportPage;

