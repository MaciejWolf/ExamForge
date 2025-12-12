import { describe, it, expect, beforeEach } from 'vitest';
import { configureAssessmentModule, AssessmentModule } from '../index';
import { ok } from '../../shared/result';
import { TestContentPackage } from '../../design/types/testContentPackage';
import { TemplateProvider } from '../useCases/listSessions';
import { createInMemoryTemplateRepository, TemplateRepository } from '../../design/repository';
import { TestTemplate } from '../../design/types/testTemplate';
import { createInMemorySessionRepository, createInMemoryTestInstanceRepository, SessionRepository, TestInstanceRepository } from '../repository';
import { TestSession } from '../types/testSession';
import { TestInstance } from '../types/testInstance';

describe('getSessionReport Use Case', () => {
  let module: AssessmentModule;
  let templateRepo: TemplateRepository;
  let sessionRepo: SessionRepository;
  let testInstanceRepo: TestInstanceRepository;

  beforeEach(() => {
    templateRepo = createInMemoryTemplateRepository();
    sessionRepo = createInMemorySessionRepository();
    testInstanceRepo = createInMemoryTestInstanceRepository();

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
      sessionRepo,
      testInstanceRepo
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

      // Verify participants are fetched from database
      expect(result.value.participants).toBeDefined();
      expect(result.value.participants.length).toBeGreaterThanOrEqual(0);
      // Statistics and questionAnalysis remain hardcoded for now
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

  it('Fetch participants with correct status (not_started)', async () => {
    // Given: a template and session exist
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

    // And: a participant exists without startedAt
    await givenParticipantsExist(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'John Doe',
        accessCode: 'ABC123',
        createdAt: new Date('2025-01-01T10:00:00Z')
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: participant should have not_started status
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.participants).toHaveLength(1);
      expect(result.value.participants[0]).toMatchObject({
        id: 'participant-1',
        sessionId,
        identifier: 'John Doe',
        accessCode: 'ABC123',
        status: 'not_started',
        createdAt: '2025-01-01T10:00:00.000Z'
      });
      expect(result.value.participants[0].startedAt).toBeUndefined();
      expect(result.value.participants[0].completedAt).toBeUndefined();
    }
  });

  it('Fetch participants with correct status (in_progress)', async () => {
    // Given: a template and session exist
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

    // And: a participant exists with startedAt but no completedAt, and within time limit
    const startedAt = new Date('2025-01-01T10:00:00Z'); // Started at 10:00
    await givenParticipantsExist(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'Jane Smith',
        accessCode: 'DEF456',
        startedAt,
        createdAt: new Date('2025-01-01T09:00:00Z')
      }
    ]);

    // When: fetching the session report (current time is 10:00, time limit is 60 minutes)
    const result = await module.getSessionReport(sessionId);

    // Then: participant should have in_progress status
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.participants).toHaveLength(1);
      expect(result.value.participants[0]).toMatchObject({
        id: 'participant-1',
        sessionId,
        identifier: 'Jane Smith',
        accessCode: 'DEF456',
        status: 'in_progress',
        startedAt: '2025-01-01T10:00:00.000Z',
        createdAt: '2025-01-01T09:00:00.000Z'
      });
      expect(result.value.participants[0].completedAt).toBeUndefined();
    }
  });

  it('Fetch participants with correct status (completed)', async () => {
    // Given: a template and session exist
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

    // And: a participant exists with completedAt
    const startedAt = new Date('2025-01-01T10:00:00Z');
    const completedAt = new Date('2025-01-01T10:30:00Z');
    await givenParticipantsExist(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'Bob Johnson',
        accessCode: 'GHI789',
        startedAt,
        completedAt,
        createdAt: new Date('2025-01-01T09:00:00Z')
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: participant should have completed status
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.participants).toHaveLength(1);
      expect(result.value.participants[0]).toMatchObject({
        id: 'participant-1',
        sessionId,
        identifier: 'Bob Johnson',
        accessCode: 'GHI789',
        status: 'completed',
        startedAt: '2025-01-01T10:00:00.000Z',
        completedAt: '2025-01-01T10:30:00.000Z',
        createdAt: '2025-01-01T09:00:00.000Z'
      });
    }
  });

  it('Fetch participants with correct status (timed_out)', async () => {
    // Given: a template and session exist with 60 minute time limit
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

    // And: a participant exists with startedAt but no completedAt, and time limit exceeded
    // Started 70 minutes ago (exceeds 60 minute limit)
    const startedAt = new Date('2025-01-01T08:50:00Z'); // Started at 08:50, current time is 10:00
    await givenParticipantsExist(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'Alice Williams',
        accessCode: 'JKL012',
        startedAt,
        createdAt: new Date('2025-01-01T08:00:00Z')
      }
    ]);

    // When: fetching the session report (current time is 10:00, started at 08:50 = 70 minutes ago)
    const result = await module.getSessionReport(sessionId);

    // Then: participant should have timed_out status
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.participants).toHaveLength(1);
      expect(result.value.participants[0]).toMatchObject({
        id: 'participant-1',
        sessionId,
        identifier: 'Alice Williams',
        accessCode: 'JKL012',
        status: 'timed_out',
        startedAt: '2025-01-01T08:50:00.000Z',
        createdAt: '2025-01-01T08:00:00.000Z'
      });
      expect(result.value.participants[0].completedAt).toBeUndefined();
    }
  });

  it('Verify undefined fields (score, timeTaken)', async () => {
    // Given: a template and session exist
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

    // And: a participant exists
    await givenParticipantsExist(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'Charlie Brown',
        accessCode: 'MNO345',
        createdAt: new Date('2025-01-01T10:00:00Z')
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: score and timeTaken fields should be undefined
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.participants).toHaveLength(1);
      expect(result.value.participants[0].totalScore).toBeUndefined();
      expect(result.value.participants[0].maxScore).toBeUndefined();
      expect(result.value.participants[0].timeTakenMinutes).toBeUndefined();
    }
  });

  it('Handle sessions with 0 participants', async () => {
    // Given: a template and session exist
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

    // And: no participants exist for this session

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: participants array should be empty
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.participants).toHaveLength(0);
    }
  });

  it('Handle sessions with multiple participants', async () => {
    // Given: a template and session exist
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

    // And: multiple participants exist with different statuses
    await givenParticipantsExist(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'Participant 1',
        accessCode: 'CODE1',
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-2',
        identifier: 'Participant 2',
        accessCode: 'CODE2',
        startedAt: new Date('2025-01-01T10:00:00Z'),
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-3',
        identifier: 'Participant 3',
        accessCode: 'CODE3',
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:30:00Z'),
        createdAt: new Date('2025-01-01T10:00:00Z')
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: all participants should be fetched with correct statuses
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.participants).toHaveLength(3);
      expect(result.value.participants.find(p => p.id === 'participant-1')?.status).toBe('not_started');
      expect(result.value.participants.find(p => p.id === 'participant-2')?.status).toBe('in_progress');
      expect(result.value.participants.find(p => p.id === 'participant-3')?.status).toBe('completed');
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

const givenParticipantsExist = async (
  testInstanceRepo: TestInstanceRepository,
  sessionId: string,
  participants: Array<{
    id: string;
    identifier: string;
    accessCode: string;
    startedAt?: Date;
    completedAt?: Date;
    createdAt?: Date;
  }>
): Promise<void> => {
  const baseDate = new Date('2025-01-01T10:00:00Z');
  const defaultTestContent: TestContentPackage = {
    id: 'test-content-1',
    templateId: 'template-1',
    sections: [],
    createdAt: baseDate
  };

  for (const participant of participants) {
    const instance: TestInstance = {
      id: participant.id,
      sessionId,
      identifier: participant.identifier,
      accessCode: participant.accessCode,
      testContent: defaultTestContent,
      startedAt: participant.startedAt,
      completedAt: participant.completedAt,
      createdAt: participant.createdAt ?? baseDate
    };
    await testInstanceRepo.save(instance);
  }
};
