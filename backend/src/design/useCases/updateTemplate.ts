import { err, ok, Result } from '../../shared/result';
import { TestTemplate, Pool } from '../types/testTemplate';
import { DesignError } from '../types/designError';
import { QuestionRepository, TemplateRepository } from '../repository';
import { validatePools } from './shared/validation';

type UpdateTemplateDeps = {
    templateRepo: TemplateRepository;
    questionRepo: QuestionRepository;
    idGenerator: () => string;
    now: () => Date;
};

export type UpdateTemplateCommand = {
    id: string;
    name?: string;
    description?: string;
    pools?: Omit<Pool, 'id'>[];
};

export const updateTemplate = ({ templateRepo, questionRepo, idGenerator, now }: UpdateTemplateDeps) => {
    return async (cmd: UpdateTemplateCommand): Promise<Result<TestTemplate, DesignError>> => {
        // Check if template exists
        const existing = await templateRepo.findById(cmd.id);
        if (!existing) {
            return err({
                type: 'TemplateNotFound',
                templateId: cmd.id,
            });
        }

        // If name is being updated, check for conflicts
        if (cmd.name !== undefined) {
            if (!cmd.name || cmd.name.trim().length === 0) {
                return err({
                    type: 'InvalidQuestionData',
                    message: 'Template name cannot be empty',
                });
            }

            const existingWithName = await templateRepo.findByName(cmd.name.trim());
            if (existingWithName && existingWithName.id !== cmd.id) {
                return err({
                    type: 'TemplateNameConflict',
                    name: cmd.name.trim(),
                });
            }
        }

        // If pools are being updated, validate them
        if (cmd.pools !== undefined) {
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
        }

        // Build updated template (monolithic update - replace entire state)
        // When pools are updated, preserve IDs where pool names match, otherwise generate new IDs
        let updatedPools: Pool[] = existing.pools;

        if (cmd.pools !== undefined) {
            updatedPools = cmd.pools.map(pool => {
                const existingPool = existing.pools.find(p => p.name === pool.name);
                return {
                    ...pool,
                    id: existingPool?.id || idGenerator(), // Preserve ID if name matches, otherwise generate new ID
                };
            });
        }

        const updatedTemplate: TestTemplate = {
            ...existing,
            name: cmd.name !== undefined ? cmd.name.trim() : existing.name,
            description: cmd.description !== undefined ? cmd.description : existing.description,
            pools: updatedPools,
            updatedAt: now(),
        };

        const savedTemplate = await templateRepo.save(updatedTemplate);

        return ok(savedTemplate);
    };
};
