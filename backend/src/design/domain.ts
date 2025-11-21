export type Tag = string;

export type Answer = string;

export type Question = {
    id: string;
    text: string;
    answers: Answer[];
    correctAnswerIndex: number;
    points: number;
    tags: Tag[];
    createdAt: Date;
    updatedAt: Date;
};

export type TestTemplate = {
    id: string;
    name: string;
    description?: string;
    pools: LocalPool[];
    createdAt: Date;
    updatedAt: Date;
};

export type LocalPool = {
    id: string;
    name: string;
    questionCount: number;
    questionIds: string[];
};

export type CreateQuestionInput = {
    text: string;
    answers: Answer[];
    correctAnswerIndex: number;
    points: number;
    tags?: Tag[];
};

export type UpdateQuestionInput = {
    text?: string;
    answers?: Answer[];
    correctAnswerIndex?: number;
    points?: number;
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

export type Result<T, E> =
    | { ok: true; value: T }
    | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({
    ok: true,
    value,
});

export const err = <E>(error: E): Result<never, E> => ({
    ok: false,
    error,
});
