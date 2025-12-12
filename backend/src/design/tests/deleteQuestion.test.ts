import { describe, it, expect, beforeEach } from 'vitest';
import { configureDesignModule, DesignModule } from '../index';
import { Result } from '../../shared/result';
import { DesignError } from '../types/designError';

describe('deleteQuestion Use Case', () => {
  let module: DesignModule;

  beforeEach(async () => {
    module = givenDesignModule();
  });

  it('Successfully delete unused question', async () => {
    const existingQuestion = await givenExistingQuestion(module);

    const result = await module.deleteQuestion(existingQuestion.id);

    thenQuestionShouldBeDeleted(result);
    await thenQuestionShouldNotBeRetrievable(module, existingQuestion.id);
  });

  it('Fail to delete question used in template', async () => {
    const existingQuestion = await givenExistingQuestion(module);
    await givenTemplateWithQuestion(module, existingQuestion.id);

    const result = await module.deleteQuestion(existingQuestion.id);

    thenDeletionShouldFailBecause(result, 'QuestionInUse');
  });

  it('Fail to delete non-existent question', async () => {
    const result = await module.deleteQuestion('non-existent-question');

    thenDeletionShouldFailBecause(result, 'QuestionNotFound');
  });

  it('Successfully delete question after removing it from template', async () => {
    const existingQuestion = await givenExistingQuestion(module);
    const otherQuestion = await givenExistingQuestion(module);
    const template = await givenTemplateWithQuestion(module, existingQuestion.id);

    // Remove question from template by updating pool to use different question
    const updateResult = await module.updateTemplate({
      id: template.id,
      pools: [{
        name: 'Pool 1',
        questionsToDraw: 1,
        pointsPerQuestion: 10,
        questionIds: [otherQuestion.id] // Use different question
      }]
    });
    expect(updateResult.ok).toBe(true);

    // Now question should be deletable
    const result = await module.deleteQuestion(existingQuestion.id);

    thenQuestionShouldBeDeleted(result);
    await thenQuestionShouldNotBeRetrievable(module, existingQuestion.id);
  });

  it('Successfully delete question after deleting containing template', async () => {
    const existingQuestion = await givenExistingQuestion(module);
    const template = await givenTemplateWithQuestion(module, existingQuestion.id);

    // Delete the template
    const deleteTemplateResult = await module.deleteTemplate(template.id);
    expect(deleteTemplateResult.ok).toBe(true);

    // Now question should be deletable
    const result = await module.deleteQuestion(existingQuestion.id);

    thenQuestionShouldBeDeleted(result);
    await thenQuestionShouldNotBeRetrievable(module, existingQuestion.id);
  });
});

const givenDesignModule = () => {
  let count = 0;
  return configureDesignModule({
    idGenerator: () => `id-${++count}`,
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

const givenTemplateWithQuestion = async (
  module: DesignModule,
  questionId: string
) => {
  const result = await module.createTemplate({
    name: 'Template 1',
    pools: [{
      name: 'Pool 1',
      questionsToDraw: 1,
      pointsPerQuestion: 10,
      questionIds: [questionId]
    }]
  });

  if (!result.ok) {
    throw new Error(`Failed to create test template: ${result.error}`);
  }
  return result.value;
};

const thenQuestionShouldBeDeleted = (result: Result<void, DesignError>) => {
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value).toBeUndefined();
  }
};

const thenQuestionShouldNotBeRetrievable = async (
  module: DesignModule,
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

