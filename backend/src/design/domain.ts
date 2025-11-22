export type Tag = {
  id: string;
  name: string;
};

export type Answer = {
  id: string;
  text: string;
};

export type Question = {
    id: string;
    text: string;
    answers: Answer[];
    correctAnswerId: string;
    points: number;
    tags: Tag[];
    createdAt: Date;
    updatedAt: Date;
};

export type TestTemplate = {
    id: string;
    name: string;
    description?: string;
    pools: Pool[];
    createdAt: Date;
    updatedAt: Date;
};

export type Pool = {
    id: string;
    name: string;
    questionCount: number;
    points: number;
    questionIds: string[];
};

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
