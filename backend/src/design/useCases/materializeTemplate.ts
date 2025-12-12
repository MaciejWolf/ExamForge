import { err, ok, Result } from '../../shared/result';
import { Question } from '../types/question';
import { DesignError } from '../types/designError';
import { QuestionRepository, TemplateRepository } from '../repository';
import { TestContentPackage, MaterializedSection } from '../types/testContentPackage';
import { createQuestionSnapshot, defaultRandomSelector, defaultShuffler } from './shared/helpers';

type MaterializeTemplateDeps = {
    templateRepo: TemplateRepository;
    questionRepo: QuestionRepository;
    idGenerator: () => string;
    now: () => Date;
    randomSelector?: <T>(items: T[], count: number) => T[];
    answerShuffler?: <T>(items: T[]) => T[];
};

export const materializeTemplate = ({
    templateRepo,
    questionRepo,
    idGenerator,
    now,
    randomSelector = defaultRandomSelector,
    answerShuffler = defaultShuffler
}: MaterializeTemplateDeps) => {
    return async (templateId: string): Promise<Result<TestContentPackage, DesignError>> => {
        // Check if template exists
        const template = await templateRepo.findById(templateId);
        if (!template) {
            return err({
                type: 'TemplateNotFound',
                templateId,
            });
        }

        // Validate and materialize each pool
        const sections: MaterializedSection[] = [];

        for (const pool of template.pools) {
            // Check if pool has sufficient questions
            const available = pool.questionIds.length;
            const required = pool.questionsToDraw;

            if (available < required) {
                return err({
                    type: 'InsufficientQuestions',
                    poolId: pool.id,
                    required,
                    available,
                });
            }

            // Fetch all questions in the pool
            const poolQuestions: Question[] = [];
            for (const questionId of pool.questionIds) {
                const question = await questionRepo.findById(questionId);
                if (question) {
                    poolQuestions.push(question);
                }
            }

            // Select random questions from the pool
            const selectedQuestions = randomSelector(poolQuestions, pool.questionsToDraw);

            // Create frozen snapshots of selected questions with answer selection and shuffling
            const frozenQuestions = selectedQuestions.map(q =>
                createQuestionSnapshot(q, randomSelector, answerShuffler)
            );

            // Create materialized section
            sections.push({
                poolId: pool.id,
                poolName: pool.name,
                points: pool.pointsPerQuestion * pool.questionsToDraw,
                questions: frozenQuestions,
            });
        }

        // Create the test content package
        const contentPackage: TestContentPackage = {
            id: idGenerator(),
            templateId: template.id,
            sections,
            createdAt: now(),
        };

        return ok(contentPackage);
    };
};
