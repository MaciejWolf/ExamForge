import { ok, Result } from '../../shared/result';
import { Question } from '../types/question';
import { DesignError } from '../types/designError';
import { QuestionRepository } from '../repository';

type ListQuestionsDeps = {
    repo: QuestionRepository;
};

export type ListQuestionsCommand = {
    tags?: string[];
};

export const listQuestions = ({ repo }: ListQuestionsDeps) => {
    return async (cmd: ListQuestionsCommand = {}): Promise<Result<Question[], DesignError>> => {
        const tags = cmd.tags || [];
        const questions = await repo.findByTags(tags);
        return ok(questions);
    };
};
