import { err, ok, Result } from '../../shared/result';
import { DesignError } from '../types/designError';
import { QuestionRepository, TemplateRepository } from '../repository';

type DeleteQuestionDeps = {
    repo: QuestionRepository;
    templateRepo: TemplateRepository;
};

export const deleteQuestion = ({ repo, templateRepo }: DeleteQuestionDeps) => {
    return async (id: string): Promise<Result<void, DesignError>> => {
        const existing = await repo.findById(id);
        if (!existing) {
            return err({
                type: 'QuestionNotFound',
                questionId: id,
            });
        }

        const templatesUsingQuestion = await templateRepo.findByQuestionId(id);
        if (templatesUsingQuestion.length > 0) {
            return err({
                type: 'QuestionInUse',
                questionId: id,
                templateIds: templatesUsingQuestion.map(t => t.id),
            });
        }

        await repo.delete(id);

        return ok(undefined);
    };
};
