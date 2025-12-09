import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { configureAssessmentModule, AssessmentModule } from '../index';
import { SessionRepository } from '../repository';
import { ok, err } from '../../shared/result';
import { TestContentPackage } from '../../design/types/testContentPackage';
import { DesignError } from '../../design/types/designError';

describe('startSession Use Case', () => {
  let module: AssessmentModule;
  let mockMaterializeTemplate: Mock;

  beforeEach(() => {
    mockMaterializeTemplate = vi.fn();

    module = configureAssessmentModule({
      materializeTemplate: mockMaterializeTemplate,
      idGenerator: () => 'test-session-id',
      now: () => new Date('2025-01-01T10:00:00Z'),
    });
  });

  it('Successfully Create Session', async () => {
    // Arrange
    const templateId = 'template-1';
    const mockPackage = givenTemplateCanBeMaterialized(templateId);

    // Act
    const result = await module.startSession(templateId);

    // Assert
    expect(mockMaterializeTemplate).toHaveBeenCalledWith(templateId);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const session = result.value;
      expect(session.id).toBe('test-session-id');
      expect(session.templateId).toBe(templateId);
      expect(session.status).toBe('open');
      expect(session.content).toEqual(mockPackage);
      expect(session.createdAt).toEqual(new Date('2025-01-01T10:00:00Z'));
    }
  });

  it('Failure: Template Not Found', async () => {
    // Arrange
    const templateId = 'invalid-id';
    givenTemplateMaterializationFails({ type: 'TemplateNotFound', templateId });

    // Act
    const result = await module.startSession(templateId);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('TemplateNotFound');
    }
  });

  it('Failure: Repository Error', async () => {
    // Arrange
    const templateId = 'template-1';
    givenTemplateCanBeMaterialized(templateId);

    // Act
    const result = await module.startSession(templateId);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('RepositoryError');
    }
  });

  it('Failure: Insufficient Questions', async () => {
    // Arrange
    const templateId = 'template-1';
    const errorDetails: DesignError = {
      type: 'InsufficientQuestions',
      poolId: 'pool-1',
      required: 5,
      available: 3
    };

    givenTemplateMaterializationFails(errorDetails);

    // Act
    const result = await module.startSession(templateId);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatchObject(errorDetails); // Should propagate error
    }
  });

  // Helper functions for domain-oriented test setup
  const givenTemplateCanBeMaterialized = (templateId: string, packageOverrides?: Partial<TestContentPackage>) => {
    const mockPackage: TestContentPackage = {
      id: 'package-1',
      templateId: templateId,
      sections: [],
      createdAt: new Date('2025-01-01T09:00:00Z'),
      ...packageOverrides,
    };
    mockMaterializeTemplate.mockResolvedValue(ok(mockPackage));
    return mockPackage;
  };

  const givenTemplateMaterializationFails = (error: DesignError) => {
    mockMaterializeTemplate.mockResolvedValue(err(error));
  };
});
