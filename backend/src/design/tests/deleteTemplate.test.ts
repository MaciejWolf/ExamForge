import { describe, it, expect, beforeEach } from 'vitest';
import { configureDesignModule, DesignModule } from '../index';
import { CreateTemplateCommand } from '../useCases';
import { Result } from '../../shared/result';
import { DesignError } from '../types/designError';

describe('deleteTemplate Use Case', () => {
  let module: DesignModule;
  let questionIds: string[];

  beforeEach(async () => {
    module = givenDesignModule();
    questionIds = await givenQuestions(module, 2);
  });

  it('Successfully delete existing template', async () => {
    // Given existing template
    const createCmd = aValidTemplate({
      pools: [{
        name: 'Pool 1',
        questionCount: 1,
        points: 10,
        questionIds: [questionIds[0]]
      }]
    });
    const createResult = await module.createTemplate(createCmd);
    expect(createResult.ok).toBe(true);
    if (!createResult.ok) return;
    const templateId = createResult.value.id;

    // When deleteTemplate is called
    const deleteResult = await module.deleteTemplate(templateId);

    // Then returns success
    expect(deleteResult.ok).toBe(true);

    // And template is no longer retrievable (verifying via update attempt)
    const updateResult = await module.updateTemplate({ id: templateId, name: 'New Name' });
    expect(updateResult.ok).toBe(false);
    if (!updateResult.ok) {
      expect(updateResult.error.type).toBe('TemplateNotFound');
    }
  });

  it('Verify deleting template does not delete questions from questions bank', async () => {
    // Given template "t-1" containing pool with question "q-1"
    const qId = questionIds[0];
    const createCmd = aValidTemplate({
      pools: [{
        name: 'Pool 1',
        questionCount: 1,
        points: 10,
        questionIds: [qId]
      }]
    });
    const createResult = await module.createTemplate(createCmd);
    if (!createResult.ok) throw new Error('Failed to create template');
    const templateId = createResult.value.id;

    // When deleteTemplate is called
    const deleteResult = await module.deleteTemplate(templateId);
    expect(deleteResult.ok).toBe(true);

    // Then question "q-1" still exists in questions bank
    const questionResult = await module.getQuestion(qId);
    expect(questionResult.ok).toBe(true);
    if (questionResult.ok) {
      expect(questionResult.value.id).toBe(qId);
    }
  });

  it('Fail to delete non-existent template', async () => {
    // Given no existing templates

    // When deleteTemplate is called with id "non-existent-template"
    const deleteResult = await module.deleteTemplate('non-existent-template');

    // Then returns error with type "TemplateNotFound"
    expect(deleteResult.ok).toBe(false);
    if (!deleteResult.ok) {
      expect(deleteResult.error.type).toBe('TemplateNotFound');
    }
  });
});

// Helpers
const givenDesignModule = () => {
  let idCounter = 1;

  return configureDesignModule({
    idGenerator: () => `test-id-${idCounter++}`,
    now: () => new Date('2025-11-22T00:00:00Z'),
  });
};

const givenQuestions = async (
  module: DesignModule,
  count: number
): Promise<string[]> => {
  const questionIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const result = await module.createQuestion({
      text: `Question ${i + 1}`,
      answers: [
        { id: 'ans-1', text: 'Answer 1' },
        { id: 'ans-2', text: 'Answer 2' },
      ],
      correctAnswerId: 'ans-1',
      tags: ['test'],
    });

    if (result.ok) {
      questionIds.push(result.value.id);
    } else {
      throw new Error(`Failed to create test question: ${result.error}`);
    }
  }

  return questionIds;
};

const aValidTemplate = (overrides: Partial<CreateTemplateCommand> = {}): CreateTemplateCommand => ({
  name: 'Test Template',
  description: undefined,
  pools: [
    {
      name: 'Math Pool',
      questionCount: 1,
      points: 10,
      questionIds: ['question-1'],
    },
  ],
  ...overrides,
});
