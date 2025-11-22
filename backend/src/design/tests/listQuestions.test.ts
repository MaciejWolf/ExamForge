import { describe, it, expect } from 'vitest';
import { configureDesignModule } from '../index';
import { Result } from '../../shared/result';
import { Question } from '../types/question';
import { DesignError } from '../types/designError';

describe('listQuestions Use Case', () => {
  it('Successfully list all questions in global bank', async () => {
    const { module, questions } = await givenQuestions([
      { id: 'q-1', tags: ['math'] },
      { id: 'q-2', tags: ['history'] },
      { id: 'q-3', tags: ['science'] },
      { id: 'q-4', tags: ['english'] },
      { id: 'q-5', tags: ['geography'] },
    ]);

    const result = await module.listQuestions();

    thenQuestionsShouldBeListed(result, questions);
  });

  it('Successfully list questions filtered by single tag', async () => {
    const { module, questions } = await givenQuestions([
      { id: 'q-1', tags: ['math'] },
      { id: 'q-2', tags: ['math', 'algebra'] },
      { id: 'q-3', tags: ['history'] },
    ]);

    const result = await module.listQuestions({ tags: ['math'] });

    thenQuestionsShouldBeListed(result, [questions[0], questions[1]]);
  });

  it('Successfully list questions filtered by multiple tags (AND logic)', async () => {
    const { module, questions } = await givenQuestions([
      { id: 'q-1', tags: ['math'] },
      { id: 'q-2', tags: ['math', 'algebra'] },
      { id: 'q-3', tags: ['history'] },
    ]);

    const result = await module.listQuestions({ tags: ['math', 'algebra'] });

    thenQuestionsShouldBeListed(result, [questions[1]]);
  });

  it('Successfully list questions with no matching tags', async () => {
    const { module } = await givenQuestions([
      { id: 'q-1', tags: ['math'] },
      { id: 'q-2', tags: ['history'] },
    ]);

    const result = await module.listQuestions({ tags: ['science'] });

    thenQuestionsShouldBeListed(result, []);
  });
});

// --- Test Helpers ---
const givenQuestions = async (
  questionSpecs: Array<{
    id: string;
    tags?: string[];
  }>
): Promise<{
  module: ReturnType<typeof configureDesignModule>;
  questions: Question[];
}> => {
  let questionIndex = 0;
  const questionModule = configureDesignModule({
    idGenerator: () => {
      const id = questionSpecs[questionIndex]?.id || `q-${questionIndex + 1}`;
      questionIndex++;
      return id;
    },
    now: () => new Date('2025-11-22T00:00:00Z'),
  });

  const createdQuestions: Question[] = [];

  for (const questionSpec of questionSpecs) {
    const command = {
      text: `Question ${questionSpec.id}`,
      answers: [
        { id: 'answer-1', text: 'Option 1' },
        { id: 'answer-2', text: 'Option 2' },
      ],
      correctAnswerId: 'answer-1',
      tags: questionSpec.tags || [],
    };

    const result = await questionModule.createQuestion(command);
    if (!result.ok) {
      throw new Error(`Failed to create test question: ${result.error}`);
    }
    createdQuestions.push(result.value);
  }

  return { module: questionModule, questions: createdQuestions };
};

const thenQuestionsShouldBeListed = (
  result: Result<Question[], DesignError>,
  expectedQuestions: Question[]
) => {
  expect(result.ok).toBe(true);
  if (!result.ok) return;

  expect(result.value).toHaveLength(expectedQuestions.length);

  const resultMap = new Map(result.value.map(q => [q.id, q]));

  for (const expectedQuestion of expectedQuestions) {
    const actualQuestion = resultMap.get(expectedQuestion.id);
    expect(actualQuestion).toBeDefined();

    if (actualQuestion) {
      expect(actualQuestion).toMatchObject({
        id: expectedQuestion.id,
        text: expectedQuestion.text,
        correctAnswerId: expectedQuestion.correctAnswerId,
      });

      expect(actualQuestion.answers).toEqual(expectedQuestion.answers);
      expect(actualQuestion.tags).toEqual(expectedQuestion.tags);
      expect(actualQuestion.createdAt).toEqual(expectedQuestion.createdAt);
      expect(actualQuestion.updatedAt).toEqual(expectedQuestion.updatedAt);

      expect(actualQuestion.id).toBeTruthy();
      expect(actualQuestion.text).toBeTruthy();
      expect(actualQuestion.answers.length).toBeGreaterThanOrEqual(2);
      expect(actualQuestion.answers.length).toBeLessThanOrEqual(6);
      expect(actualQuestion.createdAt).toBeInstanceOf(Date);
      expect(actualQuestion.updatedAt).toBeInstanceOf(Date);
    }
  }
};

