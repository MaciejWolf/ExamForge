import { describe, it, expect } from 'vitest';
import { configureDesignModule } from '../index';
import { Result } from '../../shared/result';
import { DesignError } from '../types/designError';

describe('deleteQuestion Use Case', () => {
  const module = givenDesignModule();

  it('Successfully delete unused question', async () => {
    const existingQuestion = await givenExistingQuestion(module);

    const result = await module.deleteQuestion(existingQuestion.id);

    thenQuestionShouldBeDeleted(result);
    await thenQuestionShouldNotBeRetrievable(module, existingQuestion.id);
  });

  it('Fail to delete non-existent question', async () => {
    const result = await module.deleteQuestion('non-existent-question');

    thenDeletionShouldFailBecause(result, 'QuestionNotFound');
  });
});

const givenDesignModule = () => {
  return configureDesignModule({
    idGenerator: () => 'q-1',
    now: () => new Date('2025-11-22T00:00:00Z'),
  });
};

const givenExistingQuestion = async (
  module: ReturnType<typeof configureDesignModule>,
  overrides: Partial<{
    text: string;
    answers: Array<{ id: string; text: string }>;
    correctAnswerId: string;
    tags: string[];
  }> = {}
): Promise<{ id: string }> => {
  const defaultAnswers = [
    { id: 'answer-1', text: 'Option 1' },
    { id: 'answer-2', text: 'Option 2' },
  ];

  const command = {
    text: overrides.text || 'Default question',
    answers: overrides.answers || defaultAnswers,
    correctAnswerId: overrides.correctAnswerId || 'answer-1',
    tags: overrides.tags || [],
  };

  const result = await module.createQuestion(command);
  if (!result.ok) {
    throw new Error(`Failed to create test question: ${result.error}`);
  }

  return { id: result.value.id };
};

const thenQuestionShouldBeDeleted = (result: Result<void, DesignError>) => {
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value).toBeUndefined();
  }
};

const thenQuestionShouldNotBeRetrievable = async (
  module: ReturnType<typeof configureDesignModule>,
  questionId: string
) => {
  const updateResult = await module.updateQuestion({ id: questionId, text: 'Should fail' });
  expect(updateResult.ok).toBe(false);
  if (!updateResult.ok) {
    expect(updateResult.error.type).toBe('QuestionNotFound');
  }
};

const thenDeletionShouldFailBecause = (
  result: Result<void, DesignError>,
  errorType: string
) => {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error.type).toBe(errorType);
  }
};

