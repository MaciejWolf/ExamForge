import { Result, ok, err } from '../../shared/result';
import { TestInstance } from '../types/testInstance';
import { AssessmentError } from '../types/assessmentError';
import { SessionRepository, TestInstanceRepository } from '../repository';

type StartTestInstanceDeps = {
  testInstanceRepo: TestInstanceRepository;
  sessionRepo: SessionRepository;
  now: () => Date;
};

export const startTestInstance = (deps: StartTestInstanceDeps) => async (accessCode: string): Promise<Result<TestInstance, AssessmentError>> => {
  const instance = await deps.testInstanceRepo.findByAccessCode(accessCode);
  if (!instance) {
    return err({ type: 'TestInstanceNotFound', accessCode });
  }

  const session = await deps.sessionRepo.findById(instance.sessionId);
  if (!session) {
    return err({ type: 'SessionNotFound', sessionId: instance.sessionId });
  }

  if (session.status !== 'open') {
    return err({ type: 'SessionNotOpen', sessionId: session.id, status: session.status });
  }

  if (!instance.startedAt) {
    instance.startedAt = deps.now();
    await deps.testInstanceRepo.save(instance);
  }

  return ok(instance);
};
