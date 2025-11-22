import { describe, it, expect } from 'vitest';
import { configureDesignModule, DesignModule } from '../index';
import { Result } from '../../shared/result';
import { Question } from '../types/question';
import { DesignError } from '../types/designError';

describe('getQuestion Use Case', () => {
  const module = givenDesignModule();

  it('Successfully retrieve existing question', async () => {
    const existingQuestion = await givenExistingQuestion(module, {
      text: 'What is 2+2?',
      answers: [
        { id: 'answer-1', text: '3' },
        { id: 'answer-2', text: '4' },
        { id: 'answer-3', text: '5' },
      ],
      correctAnswerId: 'answer-2',
      tags: ['math', 'basic'],
    });

    const result = await module.getQuestion('q-1');

    thenQuestionShouldBeRetrieved(result, existingQuestion);
  });

  it('Fail to retrieve non-existent question', async () => {
    const result = await module.getQuestion('non-existent-question');

    thenRetrievalShouldFailBecause(result, 'QuestionNotFound');
  });
});

const givenDesignModule = () => {
  return configureDesignModule({
    idGenerator: () => 'q-1',
    now: () => new Date('2025-11-22T00:00:00Z'),
  });
};

const givenExistingQuestion = async (
  module: DesignModule,
  overrides: Partial<{
    text: string;
    answers: Array<{ id: string; text: string }>;
    correctAnswerId: string;
    tags: string[];
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

const thenQuestionShouldBeRetrieved = (
  result: Result<Question, DesignError>,
  expectedQuestion: Question
) => {
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value).toMatchObject({
      id: expectedQuestion.id,
      text: expectedQuestion.text,
      correctAnswerId: expectedQuestion.correctAnswerId,
    });
    // Deep equality for arrays
    expect(result.value.answers).toEqual(expectedQuestion.answers);
    expect(result.value.tags).toEqual(expectedQuestion.tags);
    expect(result.value.createdAt).toEqual(expectedQuestion.createdAt);
    expect(result.value.updatedAt).toEqual(expectedQuestion.updatedAt);
  }
};

const thenRetrievalShouldFailBecause = (
  result: Result<Question, DesignError>,
  errorType: string
) => {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error.type).toBe(errorType);
  }
};

