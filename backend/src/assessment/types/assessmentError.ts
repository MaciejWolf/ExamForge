import { DesignError } from '../../design/types/designError';

export type AssessmentError =
  | { type: 'TemplateNotFound'; templateId: string }
  | { type: 'RepositoryError'; message: string; internalError?: any }
  | { type: 'InsufficientQuestions'; poolId: string; required: number; available: number }
  | { type: 'SessionNotFound'; sessionId: string }
  | { type: 'TestInstanceNotFound'; accessCode: string }
  | { type: 'SessionClosed'; sessionId: string; status: string }
  | { type: 'TestAlreadyStarted'; accessCode: string }
  | { type: 'TestNotOpenYet'; accessCode: string; startTime: Date }
  | { type: 'TestExpired'; accessCode: string; endTime: Date }
  | { type: 'DesignError'; error: DesignError }
  | { type: 'InvalidAccessCode'; accessCode: string };
