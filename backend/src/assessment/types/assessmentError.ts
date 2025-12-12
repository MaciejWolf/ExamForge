import { DesignError } from '../../design/types/designError';

export type AssessmentError =
  | { type: 'TemplateNotFound'; templateId: string }
  | { type: 'RepositoryError'; message: string; internalError?: any }
  | { type: 'InsufficientQuestions'; poolId: string; required: number; available: number }
  | { type: 'SessionNotFound'; sessionId: string }
  | { type: 'TestInstanceNotFound'; testInstanceId?: string, accessCode?: string }
  | { type: 'SessionClosed'; sessionId: string; status: string }
  | { type: 'TestAlreadyStarted'; testInstanceId: string; accessCode: string }
  | { type: 'TestNotOpenYet'; testInstanceId: string; accessCode: string; startTime: Date }
  | { type: 'TestExpired'; testInstanceId: string; endTime: Date }
  | { type: 'TestNotStarted'; testInstanceId: string }
  | { type: 'TestAlreadyFinished'; testInstanceId: string }
  | { type: 'DesignError'; error: DesignError }
  | { type: 'InvalidAccessCode'; testInstanceId: string };
