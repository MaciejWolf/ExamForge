import { err, ok, Result } from '../../shared/result';
import { Question } from '../types/question';
import { DesignError } from '../types/designError';
import { Answer } from '../types/question';
import { QuestionRepository } from '../repository';
import { validateQuestionInput } from './shared/validation';

type CreateQuestionDeps = {
    repo: QuestionRepository;
    idGenerator: () => string;
    now: () => Date;
};

export type CreateQuestionCommand = {
    text: string;
    answers: Answer[];
    correctAnswerId: string;
    tags?: string[];
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
            tags: cmd.tags || [],
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const savedQuestion = await repo.save(question);

        return ok(savedQuestion);
    };
};
