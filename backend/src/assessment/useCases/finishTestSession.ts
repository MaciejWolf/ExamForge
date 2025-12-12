import { Result, ok, err } from '../../shared/result';
import { TestInstance } from '../types/testInstance';
import { AssessmentError } from '../types/assessmentError';
import { SessionRepository, TestInstanceRepository } from '../repository';

type FinishTestSessionDeps = {
  testInstanceRepo: TestInstanceRepository;
  sessionRepo: SessionRepository;
  now: () => Date;
};

export const finishTestSession = (deps: FinishTestSessionDeps) => async (accessCode: string): Promise<Result<TestInstance, AssessmentError>> => {
  const instance = await deps.testInstanceRepo.findByAccessCode(accessCode);
  if (!instance) {
    return err({ type: 'TestInstanceNotFound', accessCode });
  }

  if (!instance.startedAt) {
    return err({ type: 'TestNotStarted', accessCode });
  }

  if (instance.completedAt) {
    return err({ type: 'TestAlreadyFinished', accessCode });
  }

  // TODO: Add validation for session expiration if needed, though plan doesn't explicitly mention it for this case yet.
  // Generally if you are finishing, checking if session is still open or valid might be required, but strictly following the plan tasks.

  instance.completedAt = deps.now();
  await deps.testInstanceRepo.save(instance);

  return ok(instance);
};
