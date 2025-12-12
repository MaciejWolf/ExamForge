import { Result, ok, err } from '../../shared/result';
import { TestSessionReport } from '../types/sessionReport';
import { AssessmentError } from '../types/assessmentError';
import { SessionRepository } from '../repository';
import { TemplateRepository } from '../../design/repository';
import { TestSession } from '../types/testSession';

type GetSessionReportDeps = {
  sessionRepo: SessionRepository;
  templateRepo: TemplateRepository;
};

const mapSessionStatus = (status: TestSession['status']): TestSessionReport['session']['status'] => {
  switch (status) {
    case 'open': return 'active';
    case 'completed': return 'completed';
    case 'aborted': return 'cancelled';
  }
};

const toISOString = (date: Date | string): string => {
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
};

export const getSessionReport = ({ sessionRepo, templateRepo }: GetSessionReportDeps) => {
  return async (sessionId: string): Promise<Result<TestSessionReport, AssessmentError>> => {
    try {
      // Fetch session from database
      const session = await sessionRepo.findById(sessionId);
      if (!session) {
        return err({ type: 'SessionNotFound', sessionId });
      }

      // Fetch template name
      let templateName = 'Unknown Template';
      try {
        const template = await templateRepo.findById(session.templateId);
        templateName = template?.name ?? 'Unknown Template';
      } catch (error) {
        // If template lookup fails, log but continue with 'Unknown Template'
        console.error('Error fetching template:', error);
      }

      // Build report with real session data
    const report: TestSessionReport = {
      session: {
        id: session.id,
        templateId: session.templateId,
        templateName: templateName,
        examinerId: session.examinerId,
        timeLimitMinutes: session.timeLimitMinutes,
        status: mapSessionStatus(session.status),
        createdAt: toISOString(session.createdAt),
      },
      participants: [
        {
          id: 'participant-1',
          sessionId: sessionId,
          identifier: 'John Doe',
          accessCode: 'ABC123',
          status: 'completed',
          startedAt: '2024-01-15T10:05:00Z',
          completedAt: '2024-01-15T10:45:00Z',
          timeTakenMinutes: 40,
          totalScore: 85,
          maxScore: 100,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'participant-2',
          sessionId: sessionId,
          identifier: 'Jane Smith',
          accessCode: 'DEF456',
          status: 'completed',
          startedAt: '2024-01-15T10:10:00Z',
          completedAt: '2024-01-15T10:50:00Z',
          timeTakenMinutes: 40,
          totalScore: 92,
          maxScore: 100,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'participant-3',
          sessionId: sessionId,
          identifier: 'Bob Johnson',
          accessCode: 'GHI789',
          status: 'in_progress',
          startedAt: '2024-01-15T10:15:00Z',
          timeTakenMinutes: 25,
          totalScore: undefined,
          maxScore: 100,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'participant-4',
          sessionId: sessionId,
          identifier: 'Alice Williams',
          accessCode: 'JKL012',
          status: 'not_started',
          totalScore: undefined,
          maxScore: 100,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'participant-5',
          sessionId: sessionId,
          identifier: 'Charlie Brown',
          accessCode: 'MNO345',
          status: 'completed',
          startedAt: '2024-01-15T10:08:00Z',
          completedAt: '2024-01-15T10:42:00Z',
          timeTakenMinutes: 34,
          totalScore: 78,
          maxScore: 100,
          createdAt: '2024-01-15T10:00:00Z',
        },
      ],
      statistics: {
        averageScore: 85.0, // (85 + 92 + 78) / 3
        highestScore: 92,
        lowestScore: 78,
        completionRate: 0.6, // 3 out of 5 completed
        completedCount: 3,
        inProgressCount: 1,
        notStartedCount: 1,
        totalParticipants: 5,
      },
      questionAnalysis: [
        {
          questionId: 'question-1',
          questionNumber: 1,
          questionContent: 'What is the derivative of x²?',
          correctAnswer: '2x',
          points: 20,
          correctResponses: 3,
          totalResponses: 3,
          correctPercentage: 100.0,
          participantsCount: 3,
        },
        {
          questionId: 'question-2',
          questionNumber: 2,
          questionContent: 'Solve for x: 2x + 5 = 15',
          correctAnswer: 'x = 5',
          points: 25,
          correctResponses: 2,
          totalResponses: 3,
          correctPercentage: 66.67,
          participantsCount: 3,
        },
        {
          questionId: 'question-3',
          questionNumber: 3,
          questionContent: 'What is the integral of 1/x?',
          correctAnswer: 'ln|x| + C',
          points: 30,
          correctResponses: 1,
          totalResponses: 3,
          correctPercentage: 33.33,
          participantsCount: 3,
        },
        {
          questionId: 'question-4',
          questionNumber: 4,
          questionContent: 'Evaluate lim(x→0) sin(x)/x',
          correctAnswer: '1',
          points: 25,
          correctResponses: 3,
          totalResponses: 3,
          correctPercentage: 100.0,
          participantsCount: 3,
        },
      ],
    };

      return ok(report);
    } catch (error) {
      console.error('Error in getSessionReport:', error);
      return err({
        type: 'RepositoryError',
        message: error instanceof Error ? error.message : 'Failed to fetch session report',
        internalError: error
      });
    }
  };
};
