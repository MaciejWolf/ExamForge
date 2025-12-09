import { Result, ok, err } from '../../shared/result';
import { TestSession } from '../types/testSession';
import { AssessmentError } from '../types/assessmentError';
import { SessionRepository } from '../repository';
import { TestContentPackage } from '../../design/types/testContentPackage';
import { DesignError } from '../../design/types/designError';

type MaterializeTemplate = (templateId: string) => Promise<Result<TestContentPackage, DesignError>>;

type StartSessionDeps = {
  sessionRepo: SessionRepository;
  materializeTemplate: MaterializeTemplate;
  idGenerator: () => string;
  now: () => Date;
};

export const startSession = (deps: StartSessionDeps) => async (templateId: string): Promise<Result<TestSession, AssessmentError>> => {
  return err({ type: 'RepositoryError', message: 'Not implemented' });
};
