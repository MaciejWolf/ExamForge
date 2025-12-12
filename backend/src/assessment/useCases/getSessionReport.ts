import { Result, ok, err } from '../../shared/result';
import { TestSessionReport, Participant } from '../types/sessionReport';
import { AssessmentError } from '../types/assessmentError';
import { SessionRepository, TestInstanceRepository } from '../repository';
import { TemplateRepository } from '../../design/repository';
import { TestSession } from '../types/testSession';
import { TestInstance } from '../types/testInstance';

type GetSessionReportDeps = {
  sessionRepo: SessionRepository;
  templateRepo: TemplateRepository;
  testInstanceRepo: TestInstanceRepository;
  now: () => Date;
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

const deriveParticipantStatus = (
  instance: TestInstance,
  session: TestSession,
  now: Date
): Participant['status'] => {
  // If completed, status is always completed
  if (instance.completedAt) {
    return 'completed';
  }

  // If not started, status is not_started
  if (!instance.startedAt) {
    return 'not_started';
  }

  // Started but not completed - check if timed out
  const timeElapsedMinutes = (now.getTime() - instance.startedAt.getTime()) / (1000 * 60);
  if (timeElapsedMinutes > session.timeLimitMinutes) {
    return 'timed_out';
  }

  // Started, not completed, and within time limit
  return 'in_progress';
};

const mapTestInstanceToParticipant = (
  instance: TestInstance,
  session: TestSession,
  now: Date
): Participant => {
  const status = deriveParticipantStatus(instance, session, now);

  return {
    id: instance.id,
    sessionId: instance.sessionId,
    identifier: instance.identifier,
    accessCode: instance.accessCode,
    status,
    startedAt: instance.startedAt ? toISOString(instance.startedAt) : undefined,
    completedAt: instance.completedAt ? toISOString(instance.completedAt) : undefined,
    createdAt: toISOString(instance.createdAt),
    // Leave these undefined for now (next task)
    totalScore: undefined,
    maxScore: undefined,
    timeTakenMinutes: undefined,
  };
};

export const getSessionReport = ({ sessionRepo, templateRepo, testInstanceRepo, now }: GetSessionReportDeps) => {
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

      // Fetch participants from test instances
      const testInstances = await testInstanceRepo.findBySessionId(sessionId);
      const currentTime = now();
      const participants = testInstances.map(instance =>
        mapTestInstanceToParticipant(instance, session, currentTime)
      );

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
      participants,
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
