import { Answer } from '../../types/question';
import { Pool } from '../../types/testTemplate';
import { DesignError } from '../../types/designError';

export type ValidationResult = {
    valid: boolean;
    message: string;
};

export type PoolValidationResult = {
    valid: boolean;
    message: string;
    errorType?: DesignError['type'];
};

export const validateQuestionInput = (input: {
    text: string;
    answers: Answer[];
    correctAnswerId: string;
    tags?: string[];
}): ValidationResult => {
    if (input.answers.length < 2) {
        return {
            valid: false,
            message: 'Question must have at least 2 answers',
        };
    }

    if (input.answers.length > 6) {
        return {
            valid: false,
            message: 'Question cannot have more than 6 answers',
        };
    }

    const correctAnswerExists = input.answers.some(answer => answer.id === input.correctAnswerId);
    if (!correctAnswerExists) {
        return {
            valid: false,
            message: 'correctAnswerId must be a valid answer ID in the answers array',
        };
    }

    if (!input.text || input.text.trim().length === 0) {
        return {
            valid: false,
            message: 'Question text cannot be empty',
        };
    }

    if (input.tags && input.tags.length > 0) {
        const tagValidation = validateTags(input.tags);
        if (!tagValidation.valid) {
            return tagValidation;
        }
    }

    return { valid: true, message: '' };
};

export const validateTags = (tags: string[]): ValidationResult => {
    const invalidTag = tags.find(tag => tag.includes('#'));
    if (invalidTag) {
        return {
            valid: false,
            message: 'Tags cannot contain the "#" character',
        };
    }
    return { valid: true, message: '' };
};

export const validatePools = async (pools: Omit<Pool, 'id'>[]): Promise<PoolValidationResult> => {
    if (pools.length === 0) {
        return {
            valid: false,
            message: 'Template must have at least one pool',
        };
    }

    // Check for duplicate pool names
    const poolNames = pools.map(p => p.name);
    const duplicateNames = poolNames.filter((name, index) => poolNames.indexOf(name) !== index);
    if (duplicateNames.length > 0) {
        return {
            valid: false,
            message: `Duplicate pool names found: ${duplicateNames.join(', ')}`,
            errorType: 'DuplicatePoolNames',
        };
    }

    // Validate each pool
    for (const pool of pools) {
        if (!pool.name || pool.name.trim().length === 0) {
            return {
                valid: false,
                message: 'Pool name is required',
            };
        }

        if (pool.questionsToDraw < 0) {
            return {
                valid: false,
                message: `Pool "${pool.name}" cannot have negative question count`,
            };
        }

        if (pool.points < 0) {
            return {
                valid: false,
                message: `Pool "${pool.name}" cannot have negative points`,
            };
        }

        // Note: We don't validate if pool has sufficient questions here
        // This validation happens at materialization time to allow flexibility
        // in template creation and editing
    }

    return { valid: true, message: '' };
};
