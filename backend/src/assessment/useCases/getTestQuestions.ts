import { Result, ok, err } from '../../shared/result';
import { AssessmentError } from '../types/assessmentError';
import { SessionRepository, TestInstanceRepository } from '../repository';
import { ParticipantTestContent, ParticipantQuestion } from '../types/participantQuestion';
import { Question } from '../../design/types/question';

type GetTestQuestionsDeps = {
  testInstanceRepo: TestInstanceRepository;
  sessionRepo: SessionRepository;
  now: () => Date;
};

// Sanitize a question by removing correctAnswerId
const sanitizeQuestion = (question: Question): ParticipantQuestion => {
  const { correctAnswerId, ...sanitized } = question;
  return sanitized as ParticipantQuestion;
};

export const getTestQuestions = (deps: GetTestQuestionsDeps) => async (accessCode: string): Promise<Result<ParticipantTestContent, AssessmentError>> => {
  const instance = await deps.testInstanceRepo.findByAccessCode(accessCode);
  if (!instance) {
    return err({ type: 'TestInstanceNotFound', accessCode });
  }

  const session = await deps.sessionRepo.findById(instance.sessionId);
  if (!session) {
    return err({ type: 'SessionNotFound', sessionId: instance.sessionId });
  }

  // Check if test has been started
  if (!instance.startedAt) {
    return err({ type: 'TestNotStarted', testInstanceId: instance.id });
  }

  // Check if session is still open
  if (session.status !== 'open') {
    return err({ type: 'SessionClosed', sessionId: session.id, status: session.status });
  }

  // Check if test is still within time window
  const now = deps.now();
  if (now < session.startTime) {
    return err({ type: 'TestNotOpenYet', testInstanceId: instance.id, startTime: session.startTime });
  }

  if (now > session.endTime) {
    return err({ type: 'TestExpired', testInstanceId: instance.id, endTime: session.endTime });
  }

  // Sanitize the test content by removing correctAnswerId from all questions
  const sanitizedSections = instance.testContent.sections.map(section => ({
    poolId: section.poolId,
    poolName: section.poolName,
    points: section.points,
    questions: section.questions.map(sanitizeQuestion)
  }));

  const sanitizedContent: ParticipantTestContent = {
    id: instance.testContent.id,
    templateId: instance.testContent.templateId,
    sections: sanitizedSections,
    createdAt: instance.testContent.createdAt
  };

  return ok(sanitizedContent);
};
