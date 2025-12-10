import { Result, ok, err } from '../../shared/result';
import { TestSession } from '../types/testSession';
import { TestInstance } from '../types/testInstance';
import { AssessmentError } from '../types/assessmentError';
import { SessionRepository, TestInstanceRepository } from '../repository';

type GetSessionByIdDeps = {
  sessionRepo: SessionRepository;
  testInstanceRepo: TestInstanceRepository;
};

type GetSessionByIdResponse = {
  session: TestSession;
  instances: TestInstance[];
};

export const getSessionById = (deps: GetSessionByIdDeps) => {
  return async (sessionId: string): Promise<Result<GetSessionByIdResponse, AssessmentError>> => {
    const session = await deps.sessionRepo.findById(sessionId);

    if (!session) {
      return err({ type: 'SessionNotFound', sessionId });
    }

    const instances = await deps.testInstanceRepo.findBySessionId(sessionId);

    return ok({
      session,
      instances
    });
  };
};

