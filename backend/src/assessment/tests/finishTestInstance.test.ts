import { describe, beforeEach, it, expect } from "vitest";
import { configureAssessmentModule, AssessmentModule } from "..";
import { ok } from '../../shared/result';
import { TestContentPackage } from '../../design/types/testContentPackage';
import { TemplateProvider } from '../useCases/listSessions';
import { TestInstance } from "../types/testInstance";

describe('finishTestInstance Use Case', () => {
  let module: AssessmentModule;
  let now: Date;

  beforeEach(() => {
    now = new Date('2024-01-01T10:00:00Z');
    module = givenAssessmentModule();
  });

  it('should finish a test instance that started 30 minutes ago', async () => {
    // Given: Session open from 9:00 to 11:00
    const sessionId = await givenSession({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
    });

    // And: Test instance started at 9:30
    const { id: testInstanceId } = await givenTestInstance({
      sessionId,
      startedAt: new Date('2024-01-01T09:30:00Z')
    });

    // When: Current time is 10:00 and we finish the test
    now = new Date('2024-01-01T10:00:00Z');
    const result = await module.finishTestInstance(testInstanceId);

    // Then: Test should be finished at 10:00
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.completedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(result.value.startedAt).toEqual(new Date('2024-01-01T09:30:00Z'));
    }
  });

  it('should return TestNotStarted error if test instance has not been started', async () => {
    const sessionId = await givenSession({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
    });

    const testInstance = await givenNotStartedTestInstance(sessionId);

    // When: Participant requests to finish the test
    now = new Date('2024-01-01T10:00:00Z');
    const result = await module.finishTestInstance(testInstance.id);

    // Then: Operation should fail
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        type: 'TestNotStarted',
        testInstanceId: testInstance.id
      });
    }
  });

  it('should return TestAlreadyFinished error if test instance has already been finished', async () => {
    // Given: Session and test instance
    const sessionId = await givenSession({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
    });

    const { id: testInstanceId } = await givenTestInstance({
      sessionId,
      startedAt: new Date('2024-01-01T09:30:00Z')
    });

    // And: Test instance is already finished
    now = new Date('2024-01-01T10:00:00Z');
    await module.finishTestInstance(testInstanceId);

    // When: Participant requests to finish the test again
    now = new Date('2024-01-01T10:05:00Z');
    const result = await module.finishTestInstance(testInstanceId);

    // Then: Operation should fail
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        type: 'TestAlreadyFinished',
        testInstanceId
      });
    }
  });

  it('should return TestInstanceNotFound error if test instance does not exist', async () => {
    // Given: No test instance with this ID
    const testInstanceId = 'non-existent-id';

    // When: Participant requests to finish the test
    const result = await module.finishTestInstance(testInstanceId);

    // Then: Operation should fail
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        type: 'TestInstanceNotFound',
        testInstanceId
      });
    }
  });

  it('should succeed if test instance is started before session ends and finished after session ends', async () => {
    const sessionId = await givenSession({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
    });

    const { id: testInstanceId } = await givenTestInstance({
      sessionId,
      startedAt: new Date('2024-01-01T09:10:59Z')
    });

    now = new Date('2024-01-01T11:30:00Z');
    const result = await module.finishTestInstance(testInstanceId);
    expect(result.ok).toBe(true);
  });

  // --- Test Helpers ---

  const givenAssessmentModule = (): AssessmentModule => {
    let idCounter = 0;
    let accessCodeCounter = 0;

    return configureAssessmentModule({
      idGenerator: () => `test-id-${++idCounter}`,
      accessCodeGenerator: () => `TEST-${String(++accessCodeCounter).padStart(3, '0')}`,
      now: () => now,
      materializeTemplate: async (templateId: string) => {
        const testContent: TestContentPackage = {
          id: `content-${templateId}`,
          templateId,
          sections: [],
          createdAt: new Date('2024-01-01T09:00:00Z')
        };
        return ok(testContent);
      },
      templateProvider: {
        getTemplateNames: async (templateIds: string[]) => {
          const names = new Map<string, string>();
          templateIds.forEach(id => names.set(id, `Template ${id}`));
          return names;
        }
      } satisfies TemplateProvider
    });
  };

  const givenSession = async (params: {
    startTime: Date;
    endTime: Date;
    testDurationMinutes: number;
  }): Promise<string> => {
    const result = await module.startSession({
      templateId: 'template-1',
      examinerId: 'examiner-1',
      timeLimitMinutes: params.testDurationMinutes,
      startTime: params.startTime,
      endTime: params.endTime,
      participantIdentifiers: ['student-1']
    });

    if (!result.ok) {
      throw new Error(`Failed to create session: ${JSON.stringify(result.error)}`);
    }

    const session = await module.getSessionById(result.value);
    if (!session.ok) {
      throw new Error(`Failed to get session: ${JSON.stringify(session.error)}`);
    }

    return result.value;
  };

  const givenTestInstance = async (params: {
    sessionId: string;
    startedAt?: Date;
  }): Promise<TestInstance> => {
    // Set clock to startedAt time if provided
    if (params.startedAt) {
      now = params.startedAt;
    }

    // Access code is predictable from accessCodeGenerator
    const accessCode = 'TEST-001';

    const startResult = await module.startTestInstance(accessCode);
    if (!startResult.ok) {
      throw new Error(`Failed to start test instance: ${JSON.stringify(startResult.error)}`);
    }

    return startResult.value;
  };

  const givenNotStartedTestInstance = async (sessionId: string): Promise<TestInstance> => {
    const sessionResult = await module.getSessionById(sessionId);
    if (!sessionResult.ok) {
      throw new Error(`Failed to get session: ${JSON.stringify(sessionResult.error)}`);
    }
    return sessionResult.value.instances[0];
  };
});
