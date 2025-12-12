import { Result, ok, err } from '../../shared/result';
import { AssessmentError } from '../types/assessmentError';
import { TestInstanceRepository, SessionRepository } from '../repository';
import { Participant, ParticipantAnswer } from '../types/sessionReport';
import { TestInstance } from '../types/testInstance';
import { TestSession } from '../types/testSession';

export type ParticipantDetail = {
  participant: Participant;
  answers: ParticipantAnswer[];
  questions: Array<{
    id: string;
    pool_id: string;
    content: string;
    answers: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
    createdAt: string;
  }>;
};

type GetParticipantDetailsDeps = {
  testInstanceRepo: TestInstanceRepository;
  sessionRepo: SessionRepository;
  now: () => Date;
};

const toISOString = (date: Date | string): string => {
  if (typeof date === 'string') return date;
  return date.toISOString();
};

const deriveParticipantStatus = (
  instance: TestInstance,
  session: TestSession,
  now: Date
): Participant['status'] => {
  if (instance.completedAt) return 'completed';
  if (!instance.startedAt) return 'not_started';

  const timeElapsedMinutes = (now.getTime() - instance.startedAt.getTime()) / (1000 * 60);
  if (timeElapsedMinutes > session.timeLimitMinutes) return 'timed_out';

  return 'in_progress';
};

export const getParticipantDetails = (deps: GetParticipantDetailsDeps) =>
  async (sessionId: string, participantId: string): Promise<Result<ParticipantDetail, AssessmentError>> => {

    // 1. Fetch Session (needed for time limit checks)
    const session = await deps.sessionRepo.findById(sessionId);
    if (!session) {
      return err({ type: 'SessionNotFound', sessionId });
    }

    // 2. Fetch Test Instance (Participant)
    const instance = await deps.testInstanceRepo.findById(participantId);
    if (!instance) {
      return err({ type: 'TestInstanceNotFound', testInstanceId: participantId });
    }

    // 3. Verify consistency
    if (instance.sessionId !== sessionId) {
      return err({ type: 'TestInstanceNotFound', testInstanceId: participantId });
    }

    // 4. Map to Participant type
    const status = deriveParticipantStatus(instance, session, deps.now());

    // Calculate max score if not set (e.g. if in progress)
    let maxScore = instance.maxScore;
    if (maxScore === undefined && instance.testContent) {
        maxScore = instance.testContent.sections.reduce((sum, section) => sum + section.points, 0);
    }

    const participant: Participant = {
      id: instance.id,
      sessionId: instance.sessionId,
      identifier: instance.identifier,
      accessCode: instance.accessCode,
      status,
      startedAt: instance.startedAt ? toISOString(instance.startedAt) : undefined,
      completedAt: instance.completedAt ? toISOString(instance.completedAt) : undefined,
      createdAt: toISOString(instance.createdAt),
      totalScore: instance.totalScore,
      maxScore: maxScore,
      timeTakenMinutes: instance.timeTakenMinutes,
    };

    // 5. Extract Questions and Answers
    const questions: ParticipantDetail['questions'] = [];
    const answers: ParticipantAnswer[] = [];
    const participantAnswers = instance.answers || {};

    if (instance.testContent) {
        for (const section of instance.testContent.sections) {
            const pointsPerQuestion = section.questions.length > 0
                ? section.points / section.questions.length
                : 0;

            for (const question of section.questions) {
                // Map question to frontend format
                const mappedQuestion = {
                    id: question.id,
                    pool_id: section.poolId,
                    content: question.text,
                    answers: question.answers.map(answer => ({
                        id: answer.id,
                        text: answer.text,
                        isCorrect: answer.id === question.correctAnswerId
                    })),
                    createdAt: toISOString(question.createdAt)
                };
                questions.push(mappedQuestion);

                // Create answer record
                const selectedAnswerId = participantAnswers[question.id] || null;
                const isCorrect = selectedAnswerId === question.correctAnswerId;

                answers.push({
                    questionId: question.id,
                    selectedAnswerId,
                    isCorrect,
                    pointsEarned: isCorrect ? pointsPerQuestion : 0,
                    pointsPossible: pointsPerQuestion
                });
            }
        }
    }

    return ok({
      participant,
      answers,
      questions
    });
  };
