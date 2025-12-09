import { DesignError } from '../../design/types/designError';

export type AssessmentError =
  | { type: 'TemplateNotFound'; templateId: string }
  | { type: 'RepositoryError'; message: string; internalError?: any }
  | { type: 'InsufficientQuestions'; poolId: string; required: number; available: number }
  | { type: 'SessionNotFound'; sessionId: string }
  | { type: 'DesignError'; error: DesignError };
