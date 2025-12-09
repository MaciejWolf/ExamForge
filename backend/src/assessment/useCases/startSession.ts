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
  // Step 1: Materialize the template to get frozen test content
  const materializationResult = await deps.materializeTemplate(templateId);

  if (!materializationResult.ok) {
    // Convert DesignError to AssessmentError
    const designError = materializationResult.error;

    // Propagate specific errors that are relevant to assessment
    if (designError.type === 'TemplateNotFound') {
      return err({ type: 'TemplateNotFound', templateId: designError.templateId });
    }

    if (designError.type === 'InsufficientQuestions') {
      return err({
        type: 'InsufficientQuestions',
        poolId: designError.poolId,
        required: designError.required,
        available: designError.available
      });
    }

    // For other design errors, wrap them
    return err({ type: 'DesignError', error: designError });
  }

  // Step 2: Create a new session with the materialized content
  const now = deps.now();
  const session: TestSession = {
    id: deps.idGenerator(),
    templateId,
    status: 'open',
    content: materializationResult.value,
    createdAt: now,
    updatedAt: now
  };

  // Step 3: Persist the session
  await deps.sessionRepo.save(session);

  return ok(session);
};
