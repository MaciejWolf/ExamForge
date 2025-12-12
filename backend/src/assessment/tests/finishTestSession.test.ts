import { describe, it, expect } from 'vitest';
import { configureAssessmentModule, AssessmentModule } from '../index';
import { ok } from '../../shared/result';
import { TestContentPackage } from '../../design/types/testContentPackage';
import { TemplateProvider } from '../useCases/listSessions';

describe('Finish Test Session Use Case', () => {
  it('Given a started test instance, when finishTestSession is called, then completedAt is updated to current time', async () => {
    const module = givenAssessmentModule();
    const accessCode = await givenStartedInstance(module);

    const result = await module.finishTestSession(accessCode);

    thenTestInstanceShouldBeFinished(result, accessCode);
  });
});

// --- Test Helpers ---

const givenAssessmentModule = (): AssessmentModule => {
  let idCounter = 0;
  let accessCodeCounter = 0;

  return configureAssessmentModule({
    idGenerator: () => `test-id-${++idCounter}`,
    accessCodeGenerator: () => `TEST-${String(++accessCodeCounter).padStart(3, '0')}`,
    now: () => new Date('2024-01-01T10:00:00Z'),
    materializeTemplate: async (templateId: string) => {
      // Mock materialization - returns a dummy test content package
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
        // Mock template provider - returns a map of template IDs to names
        const names = new Map<string, string>();
        templateIds.forEach(id => names.set(id, `Template ${id}`));
        return names;
      }
    } satisfies TemplateProvider
  });
};

const givenStartedInstance = async (module: AssessmentModule): Promise<string> => {
  const sessionResult = await module.startSession({
    templateId: 'template-1',
    examinerId: 'examiner-1',
    timeLimitMinutes: 60,
    startTime: new Date('2024-01-01T09:00:00Z'),
    endTime: new Date('2024-01-01T11:00:00Z'),
    participantIdentifiers: ['student-1']
  });

  if (!sessionResult.ok) {
    throw new Error(`Failed to create test session: ${JSON.stringify(sessionResult.error)}`);
  }

  // accessCode is TEST-001
  const accessCode = 'TEST-001';

  const startResult = await module.startTestInstance(accessCode);
  if (!startResult.ok) {
      throw new Error(`Failed to start test instance: ${JSON.stringify(startResult.error)}`);
  }

  return accessCode;
};

const thenTestInstanceShouldBeFinished = (
  result: Awaited<ReturnType<AssessmentModule['finishTestSession']>>,
  accessCode: string
) => {
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value.accessCode).toBe(accessCode);
    expect(result.value.completedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
  }
};
