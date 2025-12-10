import { Result, ok, err } from '../../shared/result';
import { TestSession } from '../types/testSession';
import { TestInstance } from '../types/testInstance';
import { AssessmentError } from '../types/assessmentError';
import { SessionRepository, TestInstanceRepository } from '../repository';
import { TestContentPackage } from '../../design/types/testContentPackage';
import { DesignError } from '../../design/types/designError';

type MaterializeTemplate = (templateId: string) => Promise<Result<TestContentPackage, DesignError>>;

type StartSessionDeps = {
  sessionRepo: SessionRepository;
  testInstanceRepo: TestInstanceRepository; // New dependency
  materializeTemplate: MaterializeTemplate;
  idGenerator: () => string;
  accessCodeGenerator: () => string; // New dependency
  now: () => Date;
};

type StartSessionRequest = {
  templateId: string;
  examinerId: string;
  timeLimitMinutes: number;
  startTime: Date;
  endTime: Date;
  participantIdentifiers: string[];
};

export const startSession = (deps: StartSessionDeps) => async (request: StartSessionRequest): Promise<Result<string, AssessmentError>> => {
  const { templateId, examinerId, timeLimitMinutes, startTime, endTime, participantIdentifiers } = request;

  // Step 1: Materialize content for EACH participant to ensure uniqueness
  // We need to do this first to catch any errors (like template not found) before creating session
  const testInstances: TestInstance[] = [];
  const sessionId = deps.idGenerator();
  const now = deps.now();

  for (const identifier of participantIdentifiers) {
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

    testInstances.push({
      id: deps.idGenerator(),
      sessionId: sessionId,
      identifier: identifier,
      accessCode: deps.accessCodeGenerator(),
      testContent: materializationResult.value,
      createdAt: now
    });
  }

  // Step 2: Create the session
  const session: TestSession = {
    id: sessionId,
    templateId,
    examinerId,
    timeLimitMinutes,
    startTime,
    endTime,
    status: 'open',
    createdAt: now,
    updatedAt: now
  };

  // Step 3: Persist session and instances
  await deps.sessionRepo.save(session);
  await deps.testInstanceRepo.saveMany(testInstances);

  return ok(sessionId);
};
