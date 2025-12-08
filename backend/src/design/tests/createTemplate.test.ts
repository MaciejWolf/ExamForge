import { describe, it, expect, beforeEach } from 'vitest';
import { configureDesignModule, DesignModule } from '../index';
import { CreateTemplateCommand } from '../useCases';
import { Result } from '../../shared/result';
import { TestTemplate } from '../types/testTemplate';
import { DesignError } from '../types/designError';

describe('createTemplate Use Case', () => {
  let module: DesignModule;
  let questionIds: string[];

  beforeEach(async () => {
    module = givenDesignModule();
    questionIds = await givenQuestions(module, 10);
  });

  it('Successfully create a new template with local pools', async () => {
    const command = aValidTemplate({
      pools: [
        {
          name: 'Math Pool',
          questionsToDraw: 2,
          points: 10,
          questionIds: questionIds.slice(0, 5),
        },
        {
          name: 'Science Pool',
          questionsToDraw: 1,
          points: 5,
          questionIds: questionIds.slice(5, 10),
        },
      ],
    });

    const result = await module.createTemplate(command);

    thenTemplateShouldBeCreated(result, command);
  });

  it('Successfully create template with description', async () => {
    const command = aValidTemplate({
      description: 'Test template description',
      pools: [
        {
          name: 'Math Pool',
          questionsToDraw: 1,
          points: 10,
          questionIds: [questionIds[0]],
        },
      ],
    });

    const result = await module.createTemplate(command);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.description).toBe('Test template description');
    }
  });

  it('Fail to create template with empty name', async () => {
    const command = aValidTemplate({
      name: '',
    });

    const result = await module.createTemplate(command);

    thenCreationShouldFailBecause(result, 'Template name is required');
  });

  it('Fail to create template with duplicate pool names', async () => {
    const questionIds = await givenQuestions(module, 2);

    const command = aValidTemplate({
      pools: [
        {
          name: 'Math Pool',
          questionsToDraw: 1,
          points: 10,
          questionIds: [questionIds[0]],
        },
        {
          name: 'Math Pool',
          questionsToDraw: 1,
          points: 5,
          questionIds: [questionIds[1]],
        },
      ],
    });

    const result = await module.createTemplate(command);

    thenCreationShouldFailWithErrorType(result, 'DuplicatePoolNames');
  });

  it('Fail to create template with empty pools', async () => {
    const command = aValidTemplate({
      pools: [],
    });

    const result = await module.createTemplate(command);

    thenCreationShouldFailBecause(result, 'at least one pool');
  });

  it('Fail to create template with pool having empty name', async () => {
    const questionIds = await givenQuestions(module, 1);

    const command = aValidTemplate({
      pools: [
        {
          name: '',
          questionsToDraw: 1,
          points: 10,
          questionIds: [questionIds[0]],
        },
      ],
    });

    const result = await module.createTemplate(command);

    thenCreationShouldFailBecause(result, 'Pool name is required');
  });

  it('Fail to create template with non-existent question ID', async () => {
    const command = aValidTemplate({
      pools: [
        {
          name: 'Math Pool',
          questionsToDraw: 1,
          points: 10,
          questionIds: ['non-existent-question-id'],
        },
      ],
    });

    const result = await module.createTemplate(command);

    thenCreationShouldFailBecause(result, 'not found');
  });

  it('Successfully create template with insufficient questions in pool (validation deferred to materialization)', async () => {
    const questionIds = await givenQuestions(module, 1);

    const command = aValidTemplate({
      pools: [
        {
          name: 'Math Pool',
          questionsToDraw: 3,
          points: 10,
          questionIds: [questionIds[0]], // Only 1 question but requires 3
        },
      ],
    });

    const result = await module.createTemplate(command);

    // Template creation should succeed - validation happens at materialization time
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.pools[0].questionIds).toHaveLength(1);
      expect(result.value.pools[0].questionsToDraw).toBe(3);
    }
  });

  it('Fail to create template with duplicate name', async () => {
    const questionIds = await givenQuestions(module, 1);

    const command = aValidTemplate({
      name: 'Test Template',
      pools: [
        {
          name: 'Math Pool',
          questionsToDraw: 1,
          points: 10,
          questionIds: [questionIds[0]],
        },
      ],
    });

    // Create first template
    await module.createTemplate(command);

    // Try to create another with same name
    const result = await module.createTemplate(command);

    thenCreationShouldFailWithErrorType(result, 'TemplateNameConflict');
  });
});

const givenDesignModule = () => {
  let idCounter = 1;

  return configureDesignModule({
    idGenerator: () => `test-id-${idCounter++}`,
    now: () => new Date('2025-11-22T00:00:00Z'),
  });
};

const givenQuestions = async (
  module: ReturnType<typeof configureDesignModule>,
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
      questionsToDraw: 1,
      points: 10,
      questionIds: ['question-1'],
    },
  ],
  ...overrides,
});

const thenTemplateShouldBeCreated = (
  result: Result<TestTemplate, DesignError>,
  originalCommand: CreateTemplateCommand
) => {
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value).toMatchObject({
      name: originalCommand.name.trim(),
      description: originalCommand.description,
      createdAt: new Date('2025-11-22T00:00:00Z'),
      updatedAt: new Date('2025-11-22T00:00:00Z'),
    });
    expect(result.value.pools).toHaveLength(originalCommand.pools.length);
    result.value.pools.forEach((pool, index) => {
      expect(pool.name).toBe(originalCommand.pools[index].name);
      expect(pool.questionsToDraw).toBe(originalCommand.pools[index].questionsToDraw);
      expect(pool.points).toBe(originalCommand.pools[index].points);
      expect(pool.questionIds).toEqual(originalCommand.pools[index].questionIds);
      expect(pool.id).toBeTruthy(); // Verify pool has an ID
    });
  }
};

const thenCreationShouldFailBecause = (
  result: Result<TestTemplate, DesignError>,
  reasonSnippet: string
) => {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    const errorMessage = 'message' in result.error ? result.error.message : JSON.stringify(result.error);
    expect(errorMessage).toContain(reasonSnippet);
  }
};

const thenCreationShouldFailWithErrorType = (
  result: Result<TestTemplate, DesignError>,
  errorType: DesignError['type']
) => {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error.type).toBe(errorType);
  }
};

