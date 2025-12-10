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
      const sessionId = result.value;

      // Verify that session ID is returned
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');

      // Verify session and instances can be fetched by ID
      const getResult = await module.getSessionById(sessionId);
      expect(getResult.ok).toBe(true);
      if (getResult.ok) {
        const { session: fetchedSession, instances: fetchedInstances } = getResult.value;

        // Verify fetched session matches created session
        expect(fetchedSession.id).toBe(sessionId);
        expect(fetchedSession.templateId).toBe(templateId);
        expect(fetchedSession.examinerId).toBe('examiner-1');
        expect(fetchedSession.status).toBe('open');
        expect(fetchedSession.timeLimitMinutes).toBe(60);

        // Verify fetched instances match created instances
        expect(fetchedInstances).toHaveLength(2);
        expect(fetchedInstances.map(i => i.identifier)).toEqual(['Alice', 'Bob']);
        expect(fetchedInstances[0].sessionId).toBe(sessionId);
        expect(fetchedInstances[1].sessionId).toBe(sessionId);

        // Verify Unique IDs and Access Codes
        expect(fetchedInstances[0].id).not.toBe(fetchedInstances[1].id);
        expect(fetchedInstances[0].accessCode).not.toBe(fetchedInstances[1].accessCode);

        // Verify Content is present
        expect(fetchedInstances[0].testContent).toBeDefined();
        expect(fetchedInstances[1].testContent).toBeDefined();
      }
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
