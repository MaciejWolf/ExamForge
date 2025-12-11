import { Result, ok } from '../../shared/result';
import { TestTemplate } from '../types/testTemplate';
import { DesignError } from '../types/designError';
import { TemplateRepository } from '../repository';

type GetTemplatesByIdsDeps = {
  templateRepo: TemplateRepository;
};

export const getTemplatesByIds = (deps: GetTemplatesByIdsDeps) => {
  return async (ids: string[]): Promise<Result<TestTemplate[], DesignError>> => {
    const templates = await deps.templateRepo.findByIds(ids);
    return ok(templates);
  };
};
