import { describe, it, expect, beforeEach } from 'vitest';
import { configureDesignModule, DesignModule } from '../index';
import { CreateTemplateCommand } from '../useCases';
import { Result } from '../../shared/result';
import { DesignError } from '../types/designError';
import { TestTemplate } from '../types/testTemplate';

describe('getTemplate Use Case', () => {
  let module: DesignModule;
  let questionIds: string[];

  beforeEach(async () => {
    module = givenDesignModule();
    questionIds = await givenQuestions(module, 2);
  });

  it('Successfully retrieve existing template with pools', async () => {
    // Given existing template (id: "t-1") containing 2 pools
    const createCmd = aValidTemplate({
      pools: [
        {
          name: 'Pool 1',
          questionCount: 1,
          points: 10,
          questionIds: [questionIds[0]]
        },
        {
          name: 'Pool 2',
          questionCount: 1,
          points: 5,
          questionIds: [questionIds[1]]
        }
      ]
    });

    const createResult = await module.createTemplate(createCmd);
    expect(createResult.ok).toBe(true);
    if (!createResult.ok) return;
    const templateId = createResult.value.id;

    // When getTemplate is called with id "t-1"
    const result = await module.getTemplate(templateId);

    // Then returns success with complete template data including all pools and their questions
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe(templateId);
      expect(result.value.name).toBe(createCmd.name);
      expect(result.value.pools).toHaveLength(2);
      expect(result.value.pools[0].name).toBe('Pool 1');
      expect(result.value.pools[0].questionIds).toContain(questionIds[0]);
      expect(result.value.pools[1].name).toBe('Pool 2');
      expect(result.value.pools[1].questionIds).toContain(questionIds[1]);
    }
  });

  it('Fail to retrieve non-existent template', async () => {
    // Given no existing templates

    // When getTemplate is called with id "non-existent-template"
    const result = await module.getTemplate('non-existent-template');

    // Then returns error with type "TemplateNotFound"
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('TemplateNotFound');
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
