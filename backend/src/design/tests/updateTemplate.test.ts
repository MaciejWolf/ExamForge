import { describe, it, expect, beforeEach } from 'vitest';
import { configureDesignModule, DesignModule } from '../index';
import { Result } from '../../shared/result';
import { TestTemplate } from '../types/testTemplate';
import { DesignError } from '../types/designError';

describe('updateTemplate Use Case', () => {
  let module: DesignModule;
  let questionIds: string[];

  beforeEach(async () => {
    module = givenDesignModule();
    questionIds = await givenQuestions(module, 10);
  });

  it('Successfully update existing template - monolithic update replacing pools', async () => {
    const template = await givenExistingTemplate(module, {
      name: 'Original Template',
      pools: [
        {
          name: 'Math Pool',
          questionCount: 2,
          points: 10,
          questionIds: [questionIds[0], questionIds[1]],
        },
      ],
    });

    const result = await module.updateTemplate({
      id: template.id,
      name: 'Updated Template',
      pools: [
        {
          name: 'Science Pool',
          questionsToDraw: 2,
          points: 15,
          questionIds: [questionIds[2], questionIds[3]],
        },
      ],
    });

    thenTemplateShouldBeUpdated(result, {
      id: template.id,
      name: 'Updated Template',
      originalCreatedAt: template.createdAt,
      pools: [
        {
          name: 'Science Pool',
          questionCount: 2,
          points: 15,
          questionIds: [questionIds[2], questionIds[3]],
        },
      ],
    });
  });

  it('Successfully update template name only', async () => {
    const template = await givenExistingTemplate(module, {
      name: 'Original Template',
      pools: [
        {
          name: 'Math Pool',
          questionCount: 2,
          points: 10,
          questionIds: questionIds.slice(0, 2),
        },
      ],
    });

    const result = await module.updateTemplate({
      id: template.id,
      name: 'Renamed Template',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('Renamed Template');
      expect(result.value.pools).toEqual(template.pools); // Pools unchanged
      expect(result.value.createdAt).toEqual(template.createdAt);
      expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(template.createdAt.getTime());
    }
  });

  it('Successfully update template description', async () => {
    const template = await givenExistingTemplate(module, {
      name: 'Test Template',
      description: 'Original description',
      pools: [
        {
          name: 'Math Pool',
          questionCount: 2,
          points: 10,
          questionIds: questionIds.slice(0, 2),
        },
      ],
    });

    const result = await module.updateTemplate({
      id: template.id,
      description: 'Updated description',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.description).toBe('Updated description');
    }
  });

  it('Successfully update template - preserve pool IDs when pool names match', async () => {
    const template = await givenExistingTemplate(module, {
      name: 'Test Template',
      pools: [
        {
          name: 'Math Pool',
          questionCount: 2,
          points: 10,
          questionIds: [questionIds[0], questionIds[1]],
        },
      ],
    });

    const originalPoolId = template.pools[0].id;

    const result = await module.updateTemplate({
      id: template.id,
      pools: [
        {
          name: 'Math Pool', // Same name
          questionsToDraw: 2,
          points: 15, // Updated points
          questionIds: [questionIds[2], questionIds[3]], // Different questions
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.pools[0].id).toBe(originalPoolId); // ID preserved
      expect(result.value.pools[0].points).toBe(15); // Points updated
      expect(result.value.pools[0].questionIds).toEqual([questionIds[2], questionIds[3]]); // Questions updated
    }
  });

  it('Fail to update non-existent template', async () => {
    const result = await module.updateTemplate({
      id: 'non-existent-template-id',
      name: 'Updated Name',
    });

    thenUpdateShouldFailBecause(result, 'TemplateNotFound');
  });

  it('Fail to update template with empty name', async () => {
    const template = await givenExistingTemplate(module, {
      name: 'Test Template',
      pools: [
        {
          name: 'Math Pool',
          questionCount: 2,
          points: 10,
          questionIds: [questionIds[0], questionIds[1]],
        },
      ],
    });

    const result = await module.updateTemplate({
      id: template.id,
      name: '',
    });

    thenUpdateShouldFailWithMessage(result, 'Template name cannot be empty');
  });

  it('Fail to update template with duplicate name', async () => {
    const template1 = await givenExistingTemplate(module, {
      name: 'Template One',
      pools: [
        {
          name: 'Math Pool',
          questionCount: 2,
          points: 10,
          questionIds: [questionIds[0], questionIds[1]],
        },
      ],
    });
    const template2 = await givenExistingTemplate(module, {
      name: 'Template Two',
      pools: [
        {
          name: 'Math Pool',
          questionCount: 2,
          points: 10,
          questionIds: [questionIds[0], questionIds[1]],
        },
      ],
    });

    const result = await module.updateTemplate({
      id: template2.id,
      name: 'Template One', // Try to use template1's name
    });

    thenUpdateShouldFailWithErrorType(result, 'TemplateNameConflict');
  });

  it('Fail to update template with duplicate pool names', async () => {
    const template = await givenExistingTemplate(module, {
      name: 'Test Template',
      pools: [
        {
          name: 'Math Pool',
          questionCount: 2,
          points: 10,
          questionIds: [questionIds[0], questionIds[1]],
        },
      ],
    });

    const result = await module.updateTemplate({
      id: template.id,
      pools: [
        {
          name: 'Math Pool',
          questionsToDraw: 1,
          points: 10,
          questionIds: [questionIds[0]],
        },
        {
          name: 'Math Pool', // Duplicate name
          questionsToDraw: 1,
          points: 5,
          questionIds: [questionIds[1]],
        },
      ],
    });

    thenUpdateShouldFailWithErrorType(result, 'DuplicatePoolNames');
  });

  it('Fail to update template with non-existent question ID', async () => {
    const template = await givenExistingTemplate(module, {
      name: 'Test Template',
      pools: [
        {
          name: 'Math Pool',
          questionCount: 2,
          points: 10,
          questionIds: [questionIds[0], questionIds[1]],
        },
      ],
    });

    const result = await module.updateTemplate({
      id: template.id,
      pools: [
        {
          name: 'Math Pool',
          questionsToDraw: 1,
          points: 10,
          questionIds: ['non-existent-question-id'],
        },
      ],
    });

    thenUpdateShouldFailWithMessage(result, 'not found');
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

const givenExistingTemplate = async (
  module: ReturnType<typeof configureDesignModule>,
  overrides: {
    name: string;
    description?: string;
    pools: Array<{
      name: string;
      questionCount: number;
      points: number;
      questionIds: string[];
    }>;
  }
): Promise<TestTemplate> => {
  const result = await module.createTemplate({
    name: overrides.name,
    description: overrides.description,
    pools: overrides.pools,
  });

  if (!result.ok) {
    throw new Error(`Failed to create test template: ${result.error}`);
  }

  return result.value;
};

const thenTemplateShouldBeUpdated = (
  result: Result<TestTemplate, DesignError>,
  expected: {
    id: string;
    name: string;
    originalCreatedAt: Date;
    pools: Array<{
      name: string;
      questionCount: number;
      points: number;
      questionIds: string[];
    }>;
  }
) => {
  expect(result.ok).toBe(true);
  if (!result.ok) return;

  expect(result.value.id).toBe(expected.id);
  expect(result.value.name).toBe(expected.name);
  expect(result.value.createdAt).toEqual(expected.originalCreatedAt);
  expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(
    expected.originalCreatedAt.getTime()
  );
  expect(result.value.pools).toHaveLength(expected.pools.length);

  expected.pools.forEach((expectedPool, index) => {
    const actualPool = result.value.pools[index];
    expect(actualPool.name).toBe(expectedPool.name);
    expect(actualPool.questionsToDraw).toBe(expectedPool.questionCount);
    expect(actualPool.points).toBe(expectedPool.points);
    expect(actualPool.questionIds).toEqual(expectedPool.questionIds);
  });
};

const thenUpdateShouldFailBecause = (
  result: Result<TestTemplate, DesignError>,
  errorType: string
) => {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error.type).toBe(errorType);
  }
};

const thenUpdateShouldFailWithMessage = (
  result: Result<TestTemplate, DesignError>,
  reasonSnippet: string
) => {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    const errorMessage = 'message' in result.error ? result.error.message : JSON.stringify(result.error);
    expect(errorMessage).toContain(reasonSnippet);
  }
};

const thenUpdateShouldFailWithErrorType = (
  result: Result<TestTemplate, DesignError>,
  errorType: DesignError['type']
) => {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error.type).toBe(errorType);
  }
};

