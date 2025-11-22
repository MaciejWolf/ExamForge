export type DesignError =
  | { type: 'InvalidQuestionData'; message: string }
  | { type: 'QuestionNotFound'; questionId: string }
  | { type: 'QuestionInUse'; questionId: string; templateIds: string[] }
  | { type: 'TemplateNotFound'; templateId: string }
  | { type: 'TemplateNameConflict'; name: string }
  | { type: 'PoolNotFound'; poolId: string }
  | { type: 'PoolNameConflict'; name: string }
  | { type: 'DuplicatePoolNames'; names: string[] }
  | { type: 'QuestionAlreadyInPool'; questionId: string; poolId: string }
  | { type: 'QuestionNotInPool'; questionId: string; poolId: string }
  | { type: 'InvalidPoolReferences'; message: string }
  | { type: 'InsufficientQuestions'; poolId: string; required: number; available: number };