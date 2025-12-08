import { err, ok, Result } from '../../shared/result';
import { Question } from '../types/question';
import { DesignError } from '../types/designError';
import { QuestionRepository } from '../repository';

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
