import { err, ok, Result } from '../shared/result';
import { Question, DesignError, Answer, Tag } from './domain';
import { QuestionRepository } from './repository';

type CreateQuestionDeps = {
  repo: QuestionRepository;
  idGenerator: () => string;
  now: () => Date;
};

export type CreateQuestionCommand = {
  text: string;
  answers: Answer[];
  correctAnswerId: string;
  points: number;
  tags?: Tag[];
};

type ValidationResult = {
  valid: boolean;
  message: string;
};

export const createQuestion = ({ repo, idGenerator, now }: CreateQuestionDeps) => {
  return async (cmd: CreateQuestionCommand): Promise<Result<Question, DesignError>> => {
    const validation = validateQuestionInput(cmd);
    if (!validation.valid) {
      return err({
        type: 'InvalidQuestionData',
        message: validation.message,
      });
    }

    const timestamp = now();
    const question: Question = {
      id: idGenerator(),
      text: cmd.text,
      answers: cmd.answers,
      correctAnswerId: cmd.correctAnswerId,
      points: cmd.points,
      tags: cmd.tags || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const savedQuestion = await repo.save(question);

    return ok(savedQuestion);
  };
};

const validateQuestionInput = (input: CreateQuestionCommand): ValidationResult => {
  if (input.answers.length < 2) {
    return {
      valid: false,
      message: 'Question must have at least 2 answers',
    };
  }

  if (input.answers.length > 6) {
    return {
      valid: false,
      message: 'Question cannot have more than 6 answers',
    };
  }

  const correctAnswerExists = input.answers.some(answer => answer.id === input.correctAnswerId);
  if (!correctAnswerExists) {
    return {
      valid: false,
      message: 'correctAnswerId must be a valid answer ID in the answers array',
    };
  }

  if (!input.text || input.text.trim().length === 0) {
    return {
      valid: false,
      message: 'Question text cannot be empty',
    };
  }

  if (input.points <= 0) {
    return {
      valid: false,
      message: 'Question points must be greater than 0',
    };
  }

  return { valid: true, message: '' };
};

type UpdateQuestionDeps = {
  repo: QuestionRepository;
  now: () => Date;
};

export type UpdateQuestionCommand = {
  id: string;
  text?: string;
  answers?: Answer[];
  correctAnswerId?: string;
  points?: number;
  tags?: Tag[];
};

export const updateQuestion = ({ repo, now }: UpdateQuestionDeps) => {
  return async (cmd: UpdateQuestionCommand): Promise<Result<Question, DesignError>> => {
    // Check if question exists
    const existing = await repo.findById(cmd.id);
    if (!existing) {
      return err({
        type: 'QuestionNotFound',
        questionId: cmd.id,
      });
    }

    // Build updated question with partial updates
    const updatedQuestion: Question = {
      ...existing,
      text: cmd.text !== undefined ? cmd.text : existing.text,
      answers: cmd.answers !== undefined ? cmd.answers : existing.answers,
      correctAnswerId: cmd.correctAnswerId !== undefined ? cmd.correctAnswerId : existing.correctAnswerId,
      points: cmd.points !== undefined ? cmd.points : existing.points,
      tags: cmd.tags !== undefined ? cmd.tags : existing.tags,
      updatedAt: now(),
    };

    // Validate the updated question
    const validation = validateQuestionInput({
      text: updatedQuestion.text,
      answers: updatedQuestion.answers,
      correctAnswerId: updatedQuestion.correctAnswerId,
      points: updatedQuestion.points,
      tags: updatedQuestion.tags,
    });
    if (!validation.valid) {
      return err({
        type: 'InvalidQuestionData',
        message: validation.message,
      });
    }

    const savedQuestion = await repo.save(updatedQuestion);

    return ok(savedQuestion);
  };
};

type DeleteQuestionDeps = {
  repo: QuestionRepository;
};

export const deleteQuestion = ({ repo }: DeleteQuestionDeps) => {
  return async (id: string): Promise<Result<void, DesignError>> => {
    const existing = await repo.findById(id);
    if (!existing) {
      return err({
        type: 'QuestionNotFound',
        questionId: id,
      });
    }

    await repo.delete(id);

    return ok(undefined);
  };
};

type GetQuestionDeps = {
  repo: QuestionRepository;
};

export const getQuestion = ({ repo }: GetQuestionDeps) => {
  return async (id: string): Promise<Result<Question, DesignError>> => {
    const question = await repo.findById(id);
    if (!question) {
      return err({
        type: 'QuestionNotFound',
        questionId: id,
      });
    }

    return ok(question);
  };
};