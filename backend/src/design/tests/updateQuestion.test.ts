import { describe, it, expect } from 'vitest';
import { configureDesignModule } from '../index';
import { Result } from '../../shared/result';
import { Question } from '../types/question';
import { DesignError } from '../types/designError';

describe('updateQuestion Use Case', () => {
  const module = configureDesignModule({
    idGenerator: () => 'q-1',
    now: () => new Date('2025-11-22T00:00:00Z'),
  });

  it('Successfully update existing question', async () => {
    const existingQuestion = await givenExistingQuestion(module, {
      text: 'Old question',
    });

    const result = await module.updateQuestion({
      id: 'q-1',
      text: 'Updated question',
    });

    thenQuestionShouldBeUpdated(result, {
      id: 'q-1',
      text: 'Updated question',
      originalCreatedAt: existingQuestion.createdAt,
    });
  });

  it('Successfully update question tags', async () => {
    await givenExistingQuestion(module, {
      tags: [{ id: 'tag-1', name: 'math' }],
    });

    const result = await module.updateQuestion({
      id: 'q-1',
      tags: [
        { id: 'tag-1', name: 'math' },
        { id: 'tag-2', name: 'algebra' },
      ],
    });

    thenTagsShouldBeUpdated(result, [
      { id: 'tag-1', name: 'math' },
      { id: 'tag-2', name: 'algebra' },
    ]);
  });

  it('Fail to update non-existent question', async () => {
    const result = await module.updateQuestion({
      id: 'non-existent-question',
      text: 'Updated question',
    });

    thenUpdateShouldFailBecause(result, 'QuestionNotFound');
  });
});

// --- Test Helpers ---
const givenExistingQuestion = async (
  module: ReturnType<typeof configureDesignModule>,
  overrides: Partial<{
    text: string;
    answers: Array<{ id: string; text: string }>;
    correctAnswerId: string;
    tags: Array<{ id: string; name: string }>;
  }> = {}
): Promise<Question> => {
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

  return result.value;
};

const thenQuestionShouldBeUpdated = (
  result: Result<Question, DesignError>,
  expected: {
    id: string;
    text?: string;
    originalCreatedAt: Date;
  }
) => {
  expect(result.ok).toBe(true);

  if (!result.ok) return;

  expect(result.value.id).toBe(expected.id);
  if (expected.text !== undefined) {
    expect(result.value.text).toBe(expected.text);
  }

  expect(result.value.createdAt).toEqual(expected.originalCreatedAt);
  expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(
    result.value.createdAt.getTime()
  );

  expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(
    expected.originalCreatedAt.getTime()
  );
};

const thenTagsShouldBeUpdated = (
  result: Result<Question, DesignError>,
  expectedTags: Array<{ id: string; name: string }>
) => {
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value.tags).toEqual(expectedTags);
  }
};

const thenUpdateShouldFailBecause = (
  result: Result<Question, DesignError>,
  errorType: string
) => {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error.type).toBe(errorType);
  }
};

