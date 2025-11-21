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
