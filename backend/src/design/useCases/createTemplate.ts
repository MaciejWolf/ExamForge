import { err, ok, Result } from '../../shared/result';
import { TestTemplate, Pool } from '../types/testTemplate';
import { DesignError } from '../types/designError';
import { QuestionRepository, TemplateRepository } from '../repository';
import { validatePools } from './shared/validation';

type CreateTemplateDeps = {
    templateRepo: TemplateRepository;
    questionRepo: QuestionRepository;
    idGenerator: () => string;
    now: () => Date;
};

export type CreateTemplateCommand = {
    name: string;
    description?: string;
    pools: Omit<Pool, 'id'>[];
};

export const createTemplate = ({ templateRepo, questionRepo, idGenerator, now }: CreateTemplateDeps) => {
    return async (cmd: CreateTemplateCommand): Promise<Result<TestTemplate, DesignError>> => {
        // Validate template name
        if (!cmd.name || cmd.name.trim().length === 0) {
            return err({
                type: 'InvalidQuestionData',
                message: 'Template name is required',
            });
        }

        // Check for name conflict
        const existingTemplate = await templateRepo.findByName(cmd.name);
        if (existingTemplate) {
            return err({
                type: 'TemplateNameConflict',
                name: cmd.name,
            });
        }

        // Validate pools
        const poolValidation = await validatePools(cmd.pools);
        if (!poolValidation.valid) {
            return err({
                type: poolValidation.errorType || 'InvalidQuestionData',
                message: poolValidation.message,
            } as DesignError);
        }

        // Verify all question IDs exist
        const allQuestionIds = cmd.pools.flatMap(pool => pool.questionIds);
        const uniqueQuestionIds = [...new Set(allQuestionIds)];

        for (const questionId of uniqueQuestionIds) {
            const question = await questionRepo.findById(questionId);
            if (!question) {
                return err({
                    type: 'InvalidQuestionData',
                    message: `Question with ID ${questionId} not found`,
                });
            }
        }

        // Generate IDs for pools
        const poolsWithIds: Pool[] = cmd.pools.map(pool => ({
            ...pool,
            id: idGenerator(),
        }));

        const timestamp = now();
        const template: TestTemplate = {
            id: idGenerator(),
            name: cmd.name.trim(),
            description: cmd.description,
            pools: poolsWithIds,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const savedTemplate = await templateRepo.save(template);

        return ok(savedTemplate);
    };
};
