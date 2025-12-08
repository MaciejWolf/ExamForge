import { err, ok, Result } from '../../shared/result';
import { Question } from '../types/question';
import { DesignError } from '../types/designError';
import { Answer } from '../types/question';
import { QuestionRepository } from '../repository';
import { validateQuestionInput, validateTags } from './shared/validation';

type UpdateQuestionDeps = {
    repo: QuestionRepository;
    now: () => Date;
};

export type UpdateQuestionCommand = {
    id: string;
    text?: string;
    answers?: Answer[];
    correctAnswerId?: string;
    tags?: string[];
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

        // Validate tags if provided
        if (cmd.tags !== undefined) {
            const tagValidation = validateTags(cmd.tags);
            if (!tagValidation.valid) {
                return err({
                    type: 'InvalidQuestionData',
                    message: tagValidation.message,
                });
            }
        }

        // Build updated question with partial updates
        const updatedQuestion: Question = {
            ...existing,
            text: cmd.text !== undefined ? cmd.text : existing.text,
            answers: cmd.answers !== undefined ? cmd.answers : existing.answers,
            correctAnswerId: cmd.correctAnswerId !== undefined ? cmd.correctAnswerId : existing.correctAnswerId,
            tags: cmd.tags !== undefined ? cmd.tags : existing.tags,
            updatedAt: now(),
        };

        // Validate the updated question
        const validation = validateQuestionInput({
            text: updatedQuestion.text,
            answers: updatedQuestion.answers,
            correctAnswerId: updatedQuestion.correctAnswerId,
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
