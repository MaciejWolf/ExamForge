import { describe, it, expect } from 'vitest';
import { configureDesignModule } from '../index';
import { CreateQuestionInput } from '../domain';


describe('createQuestion Use Case', () => {
    it('Successfully create a new question in the global bank', async () => {
        const design = configureDesignModule({
            idGenerator: () => 'test-question-id',
            now: () => new Date('2025-11-22T00:00:00Z'),
        });

        const input: CreateQuestionInput = {
            text: 'What is 2+2?',
            answers: ['3', '4', '5', '6'],
            correctAnswerIndex: 1,
            points: 2,
        };

        const result = await design.createQuestion(input);

        expect(result.ok).toBe(true);

        if (!result.ok) {
            throw new Error('Expected success result');
        }

        const question = result.value;

        expect(question.text).toBe('What is 2+2?');
        expect(question.answers).toEqual(['3', '4', '5', '6']);
        expect(question.correctAnswerIndex).toBe(1);
        expect(question.points).toBe(2);

        expect(question.id).toBe('test-question-id');

        expect(question.createdAt).toEqual(new Date('2025-11-22T00:00:00Z'));
        expect(question.updatedAt).toEqual(new Date('2025-11-22T00:00:00Z'));

        expect(question.tags).toEqual([]);
        expect(Array.isArray(question.tags)).toBe(true);
    });
});
