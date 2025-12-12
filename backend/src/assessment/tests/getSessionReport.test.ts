import { describe, it, expect, beforeEach } from 'vitest';
import { configureAssessmentModule, AssessmentModule } from '../index';
import { ok } from '../../shared/result';
import { TestContentPackage } from '../../design/types/testContentPackage';
import { TemplateProvider } from '../useCases/listSessions';
import { createInMemoryTemplateRepository, TemplateRepository } from '../../design/repository';
import { TestTemplate } from '../../design/types/testTemplate';
import { createInMemorySessionRepository, SessionRepository } from '../repository';
import { TestSession } from '../types/testSession';

describe('getSessionReport Use Case', () => {
  let module: AssessmentModule;
  let templateRepo: TemplateRepository;
  let sessionRepo: SessionRepository;

  beforeEach(() => {
    templateRepo = createInMemoryTemplateRepository();
    sessionRepo = createInMemorySessionRepository();

    module = configureAssessmentModule({
      idGenerator: () => 'test-id',
      accessCodeGenerator: () => 'TEST-001',
      now: () => new Date('2025-01-01T10:00:00Z'),
      materializeTemplate: async (templateId: string) => {
        const testContent: TestContentPackage = {
          id: `content-${templateId}`,
          templateId,
          sections: [],
          createdAt: new Date('2025-01-01T09:00:00Z')
        };
        return ok(testContent);
      },
      templateProvider: {
        getTemplateNames: async (templateIds: string[]) => {
          const names = new Map<string, string>();
          templateIds.forEach(id => names.set(id, `Template ${id}`));
          return names;
        }
      } satisfies TemplateProvider,
      templateRepo,
      sessionRepo
    });
  });

  it('Successfully fetch session report with real data', async () => {
    // Given: a template exists
    const templateId = 'template-1';
    await givenATemplateExists(templateRepo, {
      id: templateId,
      name: 'Mathematics Assessment'
    });

    // And: a session exists
    const sessionId = await givenASessionExists(module, {
      templateId,
      examinerId: 'examiner-1',
      timeLimitMinutes: 60,
      status: 'open'
    });

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: report should contain real session data
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.session).toMatchObject({
        id: sessionId,
        templateId: templateId,
        templateName: 'Mathematics Assessment',
        examinerId: 'examiner-1',
        timeLimitMinutes: 60,
        status: 'active', // mapped from 'open'
        createdAt: '2025-01-01T10:00:00.000Z'
      });

      // Verify participants, statistics, and questionAnalysis remain hardcoded
      expect(result.value.participants).toBeDefined();
      expect(result.value.participants.length).toBeGreaterThan(0);
      expect(result.value.statistics).toBeDefined();
      expect(result.value.questionAnalysis).toBeDefined();
    }
  });

  it('Return SessionNotFound when session does not exist', async () => {
    // When: fetching report for non-existent session
    const result = await module.getSessionReport('non-existent-id');

    // Then: should return SessionNotFound error
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('SessionNotFound');
      if (result.error.type === 'SessionNotFound') {
        expect(result.error.sessionId).toBe('non-existent-id');
      }
    }
  });

  it('Handle missing template gracefully with Unknown Template name', async () => {
    // Given: a session exists but template does not
    const templateId = 'non-existent-template';
    const sessionId = await givenASessionExists(module, {
      templateId,
      examinerId: 'examiner-1',
      timeLimitMinutes: 60,
      status: 'open'
    });

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: should use 'Unknown Template' as template name
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.session.templateName).toBe('Unknown Template');
      expect(result.value.session.templateId).toBe(templateId);
    }
  });

  it('Map status correctly: open -> active', async () => {
    // Given: a session with 'open' status
    const templateId = 'template-1';
    await givenATemplateExists(templateRepo, {
      id: templateId,
      name: 'Test Template'
    });

    const sessionId = await givenASessionWithStatus(sessionRepo, {
      templateId,
      examinerId: 'examiner-1',
      timeLimitMinutes: 60,
      status: 'open'
    });

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: status should be mapped to 'active'
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.session.status).toBe('active');
    }
  });

  it('Map status correctly: completed -> completed', async () => {
    // Given: a session with 'completed' status
    const templateId = 'template-1';
    await givenATemplateExists(templateRepo, {
      id: templateId,
      name: 'Test Template'
    });

    const sessionId = await givenASessionWithStatus(sessionRepo, {
      templateId,
      examinerId: 'examiner-1',
      timeLimitMinutes: 60,
      status: 'completed'
    });

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: status should be mapped to 'completed'
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.session.status).toBe('completed');
    }
  });

  it('Map status correctly: aborted -> cancelled', async () => {
    // Given: a session with 'aborted' status
    const templateId = 'template-1';
    await givenATemplateExists(templateRepo, {
      id: templateId,
      name: 'Test Template'
    });

    const sessionId = await givenASessionWithStatus(sessionRepo, {
      templateId,
      examinerId: 'examiner-1',
      timeLimitMinutes: 60,
      status: 'aborted'
    });

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: status should be mapped to 'cancelled'
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.session.status).toBe('cancelled');
    }
  });

  it('Populate all session fields from database', async () => {
    // Given: a template and session with specific values
    const templateId = 'template-2';
    await givenATemplateExists(templateRepo, {
      id: templateId,
      name: 'Science Assessment'
    });

    const sessionId = await givenASessionExists(module, {
      templateId,
      examinerId: 'examiner-2',
      timeLimitMinutes: 90,
      status: 'completed'
    });

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: all fields should be populated correctly
    expect(result.ok).toBe(true);
    if (result.ok) {
      const session = result.value.session;
      expect(session.id).toBe(sessionId);
      expect(session.templateId).toBe(templateId);
      expect(session.templateName).toBe('Science Assessment');
      expect(session.examinerId).toBe('examiner-2');
      expect(session.timeLimitMinutes).toBe(90);
      expect(session.status).toBe('completed');
      expect(session.createdAt).toBeDefined();
      expect(typeof session.createdAt).toBe('string');
    }
  });
});

// --- Test Helpers ---

const givenATemplateExists = async (
  templateRepo: TemplateRepository,
  template: Partial<TestTemplate>
): Promise<string> => {
  const fullTemplate: TestTemplate = {
    id: template.id ?? 'template-1',
    name: template.name ?? 'Test Template',
    description: template.description,
    pools: template.pools ?? [],
    createdAt: template.createdAt ?? new Date('2025-01-01T09:00:00Z'),
    updatedAt: template.updatedAt ?? new Date('2025-01-01T09:00:00Z')
  };

  await templateRepo.save(fullTemplate);
  return fullTemplate.id;
};

const givenASessionExists = async (
  module: AssessmentModule,
  options: {
    templateId: string;
    examinerId: string;
    timeLimitMinutes: number;
    status?: 'open' | 'completed' | 'aborted';
  }
): Promise<string> => {
  const now = new Date('2025-01-01T10:00:00Z');
  const startTime = new Date(now);
  const endTime = new Date(now);
  endTime.setHours(endTime.getHours() + 2);

  const result = await module.startSession({
    templateId: options.templateId,
    examinerId: options.examinerId,
    timeLimitMinutes: options.timeLimitMinutes,
    startTime,
    endTime,
    participantIdentifiers: ['Participant 1']
  });

  if (!result.ok) {
    throw new Error(`Failed to create session: ${result.error.type}`);
  }

  return result.value;
};

const givenASessionWithStatus = async (
  sessionRepo: SessionRepository,
  options: {
    templateId: string;
    examinerId: string;
    timeLimitMinutes: number;
    status: 'open' | 'completed' | 'aborted';
  }
): Promise<string> => {
  const now = new Date('2025-01-01T10:00:00Z');
  const startTime = new Date(now);
  const endTime = new Date(now);
  endTime.setHours(endTime.getHours() + 2);

  const session: TestSession = {
    id: `session-${Date.now()}-${Math.random()}`,
    templateId: options.templateId,
    examinerId: options.examinerId,
    timeLimitMinutes: options.timeLimitMinutes,
    startTime,
    endTime,
    status: options.status,
    createdAt: now,
    updatedAt: now
  };

  await sessionRepo.save(session);
  return session.id;
};
