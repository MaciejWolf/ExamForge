import { ok, Result } from '../../shared/result';
import { TestTemplate } from '../types/testTemplate';
import { DesignError } from '../types/designError';
import { TemplateRepository } from '../repository';

type ListTemplatesDeps = {
    templateRepo: TemplateRepository;
};

export const listTemplates = ({ templateRepo }: ListTemplatesDeps) => {
    return async (): Promise<Result<TestTemplate[], DesignError>> => {
        const templates = await templateRepo.findAll();
        return ok(templates);
    };
};
