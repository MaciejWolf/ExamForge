import { err, ok, Result } from '../../shared/result';
import { DesignError } from '../types/designError';
import { TemplateRepository } from '../repository';

type DeleteTemplateDeps = {
    templateRepo: TemplateRepository;
};

export const deleteTemplate = ({ templateRepo }: DeleteTemplateDeps) => {
    return async (id: string): Promise<Result<void, DesignError>> => {
        const existing = await templateRepo.findById(id);
        if (!existing) {
            return err({
                type: 'TemplateNotFound',
                templateId: id,
            });
        }

        await templateRepo.delete(id);

        return ok(undefined);
    };
};
