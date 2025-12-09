import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { configureAssessmentModule, AssessmentModule } from '../index';
import { ok, err } from '../../shared/result';
import { TestContentPackage } from '../../design/types/testContentPackage';
import { AssessmentError } from '../types/assessmentError';

describe('startSession Use Case', () => {
  let module: AssessmentModule;
  let mockMaterializeTemplate: Mock;
  let mockAccessCodeGenerator: Mock;
  let mockIdGenerator: Mock;

  const validRequest = {
    templateId: 'template-1',
    examinerId: 'examiner-1',
    timeLimitMinutes: 60,
    startTime: new Date('2025-01-01T10:00:00Z'),
    endTime: new Date('2025-01-01T12:00:00Z'),
    participantIdentifiers: ['Alice', 'Bob']
  };

  beforeEach(() => {
    mockMaterializeTemplate = vi.fn();
    mockAccessCodeGenerator = vi.fn().mockImplementation(() => `AC-${Math.random()}`);
    mockIdGenerator = vi.fn().mockImplementation(() => `ID-${Math.random()}`);

    module = configureAssessmentModule({
      materializeTemplate: mockMaterializeTemplate,
      idGenerator: mockIdGenerator,
      accessCodeGenerator: mockAccessCodeGenerator,
      now: () => new Date('2025-01-01T10:00:00Z'),
    });
  });

  it('Successfully Create Session with Multiple Participants', async () => {
    // Arrange
    const templateId = 'template-1';
    givenTemplateCanBeMaterialized(templateId);

    // Act
    const result = await module.startSession(validRequest);

    // Assert
    expect(mockMaterializeTemplate).toHaveBeenCalledTimes(2); // Once for Alice, once for Bob

    expect(result.ok).toBe(true);
    if (result.ok) {
      const { session, instances } = result.value;

      // Verify Session
      expect(session.templateId).toBe(templateId);
      expect(session.examinerId).toBe('examiner-1');
      expect(session.status).toBe('open');
      expect(session.timeLimitMinutes).toBe(60);

      // Verify Instances
      expect(instances).toHaveLength(2);
      expect(instances.map(i => i.identifier)).toEqual(['Alice', 'Bob']);
      expect(instances[0].sessionId).toBe(session.id);
      expect(instances[1].sessionId).toBe(session.id);

      // Verify Unique IDs and Access Codes
      expect(instances[0].id).not.toBe(instances[1].id);
      expect(instances[0].accessCode).not.toBe(instances[1].accessCode);

      // Verify Content is present
      expect(instances[0].testContent).toBeDefined();
      expect(instances[1].testContent).toBeDefined();
    }
  });

  it('Failure: Template Not Found', async () => {
    // Arrange
    const templateId = 'invalid-id';
    givenTemplateMaterializationFails({ type: 'TemplateNotFound', templateId });

    // Act
    const result = await module.startSession({ ...validRequest, templateId });

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('TemplateNotFound');
    }
  });

  it('Failure: Insufficient Questions', async () => {
    // Arrange
    const errorDetails: AssessmentError = {
      type: 'InsufficientQuestions',
      poolId: 'pool-1',
      required: 5,
      available: 3
    };

    givenTemplateMaterializationFails(errorDetails);

    // Act
    const result = await module.startSession(validRequest);

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

  const givenTemplateMaterializationFails = (error: AssessmentError) => {
    mockMaterializeTemplate.mockResolvedValue(err(error));
  };
});
