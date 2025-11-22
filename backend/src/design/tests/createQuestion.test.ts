import { describe, it, expect } from 'vitest';
import { configureDesignModule } from '../index';
import { CreateQuestionCommand } from '../useCases';
import { Result } from '../../shared/result';
import { Question, DesignError } from '../domain';

describe('createQuestion Use Case', () => {
  const module = givenDesignModule();

  it('Successfully create a new question in the global bank', async () => {
    const command = aValidQuestion();

    const result = await module.createQuestion(command);

    thenQuestionShouldBeCreated(result, command);
  });

  it('Fail to create question with invalid data - too few answers', async () => {
    const command = aValidQuestion({
      answers: [{ id: 'answer-1', text: '4' }], // Override with invalid data
    });

    const result = await module.createQuestion(command);

    thenCreationShouldFailBecause(result, 'at least 2 answers');
  });

  it('Fail to create question with invalid data - too many answers', async () => {
    const command = aValidQuestion({
      answers: Array(7).fill(null).map((_, i) => ({ id: `ans-${i}`, text: `${i}` })),
    });

    const result = await module.createQuestion(command);

    thenCreationShouldFailBecause(result, 'more than 6 answers');
  });

  it('Fail to create question with invalid correct answer index', async () => {
    const command = aValidQuestion({
      correctAnswerId: 'non-existent-answer-id',
    });

    const result = await module.createQuestion(command);

    thenCreationShouldFailBecause(result, 'correctAnswerId must be a valid answer ID');
  });
});

const givenDesignModule = () => {
  return configureDesignModule({
    idGenerator: () => 'test-question-id',
    now: () => new Date('2025-11-22T00:00:00Z'),
  });
};

const aValidQuestion = (overrides: Partial<CreateQuestionCommand> = {}): CreateQuestionCommand => ({
  text: 'What is 2+2?',
  answers: [
    { id: 'answer-1', text: '3' },
    { id: 'answer-2', text: '4' },
    { id: 'answer-3', text: '5' },
    { id: 'answer-4', text: '6' },
  ],
  correctAnswerId: 'answer-2',
  points: 2,
  tags: [
    { id: 'tag-1', name: 'math' },
    { id: 'tag-2', name: 'algebra' },
  ],
  ...overrides,
});

const thenQuestionShouldBeCreated = (
  result: Result<Question, DesignError>,
  originalCommand: CreateQuestionCommand
) => {
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value).toMatchObject({
      text: originalCommand.text,
      points: originalCommand.points,
      correctAnswerId: originalCommand.correctAnswerId,
      // Verify stubs were used
      id: 'test-question-id',
      createdAt: new Date('2025-11-22T00:00:00Z'),
      updatedAt: new Date('2025-11-22T00:00:00Z'),
    });
    // Deep equality for arrays
    expect(result.value.answers).toEqual(originalCommand.answers);
    expect(result.value.tags).toEqual(originalCommand.tags || []);
  }
};

const thenCreationShouldFailBecause = (
  result: Result<Question, DesignError>,
  reasonSnippet: string
) => {
  expect(result.ok).toBe(false);
  if (!result.ok && result.error.type === 'InvalidQuestionData') {
    expect(result.error.message).toContain(reasonSnippet);
  }
};
