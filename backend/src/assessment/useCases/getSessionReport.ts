import { Result, ok, err } from '../../shared/result';
import { TestSessionReport, Participant, SessionStatistics, QuestionAnalysis } from '../types/sessionReport';
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
    totalScore: instance.totalScore,
    maxScore: instance.maxScore,
    timeTakenMinutes: instance.timeTakenMinutes,
  };
};

const calculateStatistics = (participants: Participant[]): SessionStatistics => {
  const totalParticipants = participants.length;

  // Count participants by status
  const completedCount = participants.filter(p => p.status === 'completed').length;
  const inProgressCount = participants.filter(p => p.status === 'in_progress').length;
  const notStartedCount = participants.filter(p =>
    p.status === 'not_started' || p.status === 'timed_out'
  ).length;

  // Calculate completion rate (handle division by zero)
  const completionRate = totalParticipants > 0
    ? completedCount / totalParticipants
    : 0;

  // Filter completed participants for score calculations
  const completedParticipants = participants.filter(p => p.status === 'completed');

  // Calculate score statistics (only from completed participants)
  let averageScore = 0;
  let highestScore = 0;
  let lowestScore = 0;

  if (completedParticipants.length > 0) {
    // Filter out participants without scores
    const participantsWithScores = completedParticipants.filter(
      p => p.totalScore !== undefined && p.totalScore !== null
    );

    if (participantsWithScores.length > 0) {
      const scores = participantsWithScores.map(p => p.totalScore!);
      averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      highestScore = Math.max(...scores);
      lowestScore = Math.min(...scores);
    }
  }

  return {
    totalParticipants,
    completedCount,
    inProgressCount,
    notStartedCount,
    completionRate,
    averageScore,
    highestScore,
    lowestScore,
  };
};

type QuestionStat = {
  questionId: string;
  questionContent: string;
  correctAnswer: string;
  points: number;
  participantsCount: number;
  correctResponses: number;
  totalResponses: number;
};

const calculateQuestionAnalysis = (testInstances: TestInstance[]): QuestionAnalysis[] => {
  // Filter to only completed instances
  const completedInstances = testInstances.filter(instance => instance.completedAt !== undefined);

  // If no completed instances, return empty array
  if (completedInstances.length === 0) {
    return [];
  }

  // Map to store statistics for each question (keyed by questionId)
  const questionStatsMap = new Map<string, QuestionStat>();

  // Iterate through each completed instance
  for (const instance of completedInstances) {
    // Iterate through each section in the test content
    for (const section of instance.testContent.sections) {
      // Calculate points per question for this section
      const pointsPerQuestion = section.questions.length > 0
        ? section.points / section.questions.length
        : 0;

      // Iterate through each question in the section
      for (const question of section.questions) {
        // Get or initialize stats for this question
        let stats = questionStatsMap.get(question.id);

        if (!stats) {
          // Find the correct answer text
          const correctAnswerObj = question.answers.find(a => a.id === question.correctAnswerId);
          const correctAnswerText = correctAnswerObj?.text ?? 'Unknown';

          // Initialize stats for this question
          stats = {
            questionId: question.id,
            questionContent: question.text,
            correctAnswer: correctAnswerText,
            points: pointsPerQuestion,
            participantsCount: 0,
            correctResponses: 0,
            totalResponses: 0,
          };
          questionStatsMap.set(question.id, stats);
        }

        // Increment participantsCount (this participant saw this question)
        stats.participantsCount += 1;

        // Check if this participant answered this question
        const participantAnswerId = instance.answers?.[question.id];
        if (participantAnswerId !== undefined && participantAnswerId !== null) {
          // Increment totalResponses (this participant answered)
          stats.totalResponses += 1;

          // Check if the answer is correct
          if (participantAnswerId === question.correctAnswerId) {
            stats.correctResponses += 1;
          }
        }
      }
    }
  }

  // Convert map to array
  const questionAnalysisArray: QuestionAnalysis[] = Array.from(questionStatsMap.values())
    // Sort by questionContent for deterministic ordering
    .sort((a, b) => a.questionContent.localeCompare(b.questionContent))
    // Assign sequential question numbers and calculate percentages
    .map((stats, index) => {
      const correctPercentage = stats.totalResponses > 0
        ? (stats.correctResponses / stats.totalResponses) * 100
        : 0;

      return {
        questionId: stats.questionId,
        questionNumber: index + 1,
        questionContent: stats.questionContent,
        correctAnswer: stats.correctAnswer,
        points: stats.points,
        correctResponses: stats.correctResponses,
        totalResponses: stats.totalResponses,
        correctPercentage: Math.round(correctPercentage * 100) / 100, // Round to 2 decimal places
        participantsCount: stats.participantsCount,
      };
    });

  return questionAnalysisArray;
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

      // Calculate statistics from participant data
      const statistics = calculateStatistics(participants);

      // Calculate question analysis from test instances
      const questionAnalysis = calculateQuestionAnalysis(testInstances);

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
        statistics,
        questionAnalysis,
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
