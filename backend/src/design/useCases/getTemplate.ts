import { err, ok, Result } from '../../shared/result';
import { TestTemplate } from '../types/testTemplate';
import { DesignError } from '../types/designError';
import { TemplateRepository } from '../repository';

type GetTemplateDeps = {
    templateRepo: TemplateRepository;
};

export const getTemplate = ({ templateRepo }: GetTemplateDeps) => {
    return async (id: string): Promise<Result<TestTemplate, DesignError>> => {
        const template = await templateRepo.findById(id);
        if (!template) {
            return err({
                type: 'TemplateNotFound',
                templateId: id,
            });
        }

        return ok(template);
    };
};
