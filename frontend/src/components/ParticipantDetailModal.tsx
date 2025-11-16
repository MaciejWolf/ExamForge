import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { testSessionsApi, type ParticipantDetail, type Question, type ParticipantAnswer } from '@/services/api';
import { toast } from 'sonner';

interface ParticipantDetailModalProps {
  sessionId: string;
  participantId: string | null;
  timeLimitMinutes: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ParticipantDetailModal = ({
  sessionId,
  participantId,
  timeLimitMinutes,
  open,
  onOpenChange,
}: ParticipantDetailModalProps) => {
  const [detail, setDetail] = useState<ParticipantDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && participantId) {
      fetchParticipantDetails();
    } else {
      setDetail(null);
    }
  }, [open, participantId, sessionId]);

  const fetchParticipantDetails = async () => {
    if (!participantId) return;

    try {
      setLoading(true);
      const data = await testSessionsApi.getParticipantDetails(sessionId, participantId);
      setDetail(data);
    } catch (error) {
      toast.error('Failed to load participant details', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeTaken = (minutes: number | undefined, timeLimit: number): string => {
    if (!minutes) return 'N/A';
    const percentage = Math.round((minutes / timeLimit) * 100);
    return `${minutes} minutes (${percentage}% of limit)`;
  };

  const getAnswerText = (question: Question, answer: ParticipantAnswer | undefined): string => {
    if (!answer || !answer.selected_answer_id) return 'Not answered';
    const selectedAnswer = question.answers.find((a) => a.id === answer.selected_answer_id);
    return selectedAnswer?.text || 'Unknown';
  };

  const getCorrectAnswerText = (question: Question): string => {
    const correctAnswer = question.answers.find((a) => a.isCorrect);
    return correctAnswer?.text || 'N/A';
  };

  if (!participantId) return null;

  const participant = detail?.participant;
  const isNotStarted = participant?.status === 'not_started';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Participant Details</DialogTitle>
          <DialogDescription>
            Detailed test results for {participant?.identifier || 'participant'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading participant details...</p>
          </div>
        ) : !detail ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : isNotStarted ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="font-medium">Name/ID: {participant.identifier}</p>
              <p className="text-sm text-muted-foreground">
                Access Code: {participant.access_code} <span className="text-red-600">(unused)</span>
              </p>
            </div>
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm">
                This participant has not started the test yet. They can use their access code to begin when ready.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Participant Metadata */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name/ID</p>
                  <p className="text-base">{participant.identifier}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Access Code</p>
                  <p className="text-base">
                    {participant.access_code}{' '}
                    <span className="text-green-600 text-sm">(used)</span>
                  </p>
                </div>
              </div>

              {participant.started_at && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Started</p>
                    <p className="text-base">{formatDateTime(participant.started_at)}</p>
                  </div>
                  {participant.completed_at ? (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-base">{formatDateTime(participant.completed_at)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p className="text-base text-yellow-600">In Progress</p>
                    </div>
                  )}
                </div>
              )}

              {participant.time_taken_minutes !== undefined && participant.max_score && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time Taken</p>
                    <p className="text-base">
                      {formatTimeTaken(participant.time_taken_minutes, timeLimitMinutes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Final Score</p>
                    <p className="text-base font-semibold">
                      {participant.total_score ?? 0}/{participant.max_score} (
                      {participant.max_score > 0
                        ? Math.round(((participant.total_score ?? 0) / participant.max_score) * 100)
                        : 0}
                      %)
                      {participant.status === 'in_progress' && (
                        <span className="text-yellow-600 text-sm ml-2">- In Progress</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Question Breakdown */}
            {detail.questions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Question Breakdown</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Answer</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.questions.map((question, index) => {
                        const answer = detail.answers.find((a) => a.question_id === question.id);
                        const isCorrect = answer?.is_correct ?? false;
                        const pointsEarned = answer?.points_earned ?? 0;
                        const pointsPossible = answer?.points_possible ?? question.points;

                        return (
                          <TableRow key={question.id}>
                            <TableCell className="font-medium">Q{index + 1}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p>{getAnswerText(question, answer)}</p>
                                {!isCorrect && answer && (
                                  <p className="text-xs text-muted-foreground">
                                    Correct: {getCorrectAnswerText(question)}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {answer ? (
                                isCorrect ? (
                                  <span className="text-green-600 font-semibold">✓</span>
                                ) : (
                                  <span className="text-red-600 font-semibold">✗</span>
                                )
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {pointsEarned}/{pointsPossible}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

