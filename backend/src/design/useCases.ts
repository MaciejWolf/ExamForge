import { v4 as uuidv4 } from 'uuid';
import {
    Question,
    CreateQuestionInput,
    Result,
    DesignError,
    ok,
    err,
} from './domain';
import { QuestionRepository } from './repository';

type CreateQuestionDeps = {
    repo: QuestionRepository;
    idGenerator: () => string;
    now: () => Date;
};

type ValidationResult = {
    valid: boolean;
    message: string;
};

const validateQuestionInput = (input: CreateQuestionInput): ValidationResult => {
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

    if (
        input.correctAnswerIndex < 0 ||
        input.correctAnswerIndex >= input.answers.length
    ) {
        return {
            valid: false,
            message: 'correctAnswerIndex must be a valid index in the answers array',
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

export const createQuestion = ({ repo, idGenerator, now }: CreateQuestionDeps) => {
    return async (input: CreateQuestionInput): Promise<Result<Question, DesignError>> => {
        const validation = validateQuestionInput(input);
        if (!validation.valid) {
            return err({
                type: 'InvalidQuestionData',
                message: validation.message,
            });
        }

        const timestamp = now();
        const question: Question = {
            id: idGenerator(),
            text: input.text,
            answers: input.answers,
            correctAnswerIndex: input.correctAnswerIndex,
            points: input.points,
            tags: input.tags || [],
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const savedQuestion = await repo.save(question);

        return ok(savedQuestion);
    };
};

