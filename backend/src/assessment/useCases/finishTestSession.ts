import { Result, ok, err } from '../../shared/result';
import { TestInstance } from '../types/testInstance';
import { AssessmentError } from '../types/assessmentError';
import { SessionRepository, TestInstanceRepository } from '../repository';

type FinishTestInstanceDeps = {
  testInstanceRepo: TestInstanceRepository;
  sessionRepo: SessionRepository;
  now: () => Date;
};

export const finishTestInstance = (deps: FinishTestInstanceDeps) => async (testInstanceId: string, answers?: Record<string, string>): Promise<Result<TestInstance, AssessmentError>> => {
  const instance = await deps.testInstanceRepo.findById(testInstanceId);
  if (!instance) {
    return err({ type: 'TestInstanceNotFound', testInstanceId });
  }

  if (!instance.startedAt) {
    return err({ type: 'TestNotStarted', testInstanceId });
  }

  if (instance.completedAt) {
    return err({ type: 'TestAlreadyFinished', testInstanceId });
  }

  // Validate answers if provided
  if (answers !== undefined && (typeof answers !== 'object' || answers === null || Array.isArray(answers))) {
    return err({ type: 'RepositoryError', message: 'Answers must be an object if provided' });
  }

  // Persist answers atomically with completion status
  if (answers !== undefined) {
    instance.answers = answers;
  }

  instance.completedAt = deps.now();
  await deps.testInstanceRepo.save(instance);

  return ok(instance);
};
