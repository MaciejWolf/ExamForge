import { describe, it, expect, beforeEach } from 'vitest';
import { configureDesignModule, DesignModule } from '../index';
import { CreateTemplateCommand } from '../useCases';

describe('listTemplates Use Case', () => {
  let module: DesignModule;
  let questionIds: string[];

  beforeEach(async () => {
    module = givenDesignModule();
    questionIds = await givenQuestions(module, 1);
  });

  it('Successfully list all templates', async () => {
    // Given 3 existing templates
    await givenTemplate(module, questionIds[0], 'Template 1');
    await givenTemplate(module, questionIds[0], 'Template 2');
    await givenTemplate(module, questionIds[0], 'Template 3');

    // When listTemplates is called
    const result = await module.listTemplates();

    // Then returns success with array containing all 3 templates
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(3);
      // Verify names are present
      const names = result.value.map(t => t.name);
      expect(names).toContain('Template 1');
      expect(names).toContain('Template 2');
      expect(names).toContain('Template 3');
    }
  });

  it('Successfully list empty templates', async () => {
    // Given no existing templates

    // When listTemplates is called
    const result = await module.listTemplates();

    // Then returns success with empty array
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(0);
      expect(result.value).toEqual([]);
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

const givenTemplate = async (
  module: DesignModule,
  questionId: string,
  name: string
) => {
  const cmd: CreateTemplateCommand = {
    name,
    description: `Description for ${name}`,
    pools: [
      {
        name: 'Default Pool',
        questionsToDraw: 1,
        points: 10,
        questionIds: [questionId]
      }
    ]
  };

  const result = await module.createTemplate(cmd);
  if (!result.ok) {
    throw new Error(`Failed to create template: ${result.error}`);
  }
  return result.value;
};



