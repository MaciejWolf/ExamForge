import { describe, it, expect, beforeEach } from 'vitest';
import { configureAssessmentModule, AssessmentModule } from '../index';
import { ok } from '../../shared/result';
import { TestContentPackage, MaterializedSection } from '../../design/types/testContentPackage';
import { TemplateProvider } from '../useCases/listSessions';
import { createInMemoryTemplateRepository, TemplateRepository } from '../../design/repository';
import { TestTemplate } from '../../design/types/testTemplate';
import { createInMemorySessionRepository, createInMemoryTestInstanceRepository, SessionRepository, TestInstanceRepository } from '../repository';
import { TestSession } from '../types/testSession';
import { TestInstance } from '../types/testInstance';
import { Question } from '../../design/types/question';

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
      // Verify statistics are calculated from participant data
      expect(result.value.statistics).toBeDefined();
      expect(result.value.statistics.totalParticipants).toBe(result.value.participants.length);
      expect(result.value.statistics.completedCount).toBeGreaterThanOrEqual(0);
      expect(result.value.statistics.inProgressCount).toBeGreaterThanOrEqual(0);
      expect(result.value.statistics.notStartedCount).toBeGreaterThanOrEqual(0);
      expect(result.value.statistics.completionRate).toBeGreaterThanOrEqual(0);
      expect(result.value.statistics.completionRate).toBeLessThanOrEqual(1);
      // Statistics and questionAnalysis remain hardcoded for now
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

    const sessionId = await givenASessionWithStatus(sessionRepo, {
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

  it('Calculate statistics with empty participant list', async () => {
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

    // And: no participants exist

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: all statistics should be 0
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.statistics).toEqual({
        totalParticipants: 0,
        completedCount: 0,
        inProgressCount: 0,
        notStartedCount: 0,
        completionRate: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      });
    }
  });

  it('Calculate statistics with no completed participants', async () => {
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

    // And: participants exist but none are completed
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
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: score statistics should be 0, completion rate should be 0
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.statistics.totalParticipants).toBe(2);
      expect(result.value.statistics.completedCount).toBe(0);
      expect(result.value.statistics.inProgressCount).toBe(1);
      expect(result.value.statistics.notStartedCount).toBe(1);
      expect(result.value.statistics.completionRate).toBe(0);
      expect(result.value.statistics.averageScore).toBe(0);
      expect(result.value.statistics.highestScore).toBe(0);
      expect(result.value.statistics.lowestScore).toBe(0);
    }
  });

  it('Calculate statistics with mixed statuses and scores', async () => {
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

    // And: participants exist with different statuses and scores
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
        totalScore: 85,
        maxScore: 100,
        timeTakenMinutes: 30,
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-4',
        identifier: 'Participant 4',
        accessCode: 'CODE4',
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:25:00Z'),
        totalScore: 92,
        maxScore: 100,
        timeTakenMinutes: 25,
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-5',
        identifier: 'Participant 5',
        accessCode: 'CODE5',
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:35:00Z'),
        totalScore: 78,
        maxScore: 100,
        timeTakenMinutes: 35,
        createdAt: new Date('2025-01-01T10:00:00Z')
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: statistics should be calculated correctly
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.statistics.totalParticipants).toBe(5);
      expect(result.value.statistics.completedCount).toBe(3);
      expect(result.value.statistics.inProgressCount).toBe(1);
      expect(result.value.statistics.notStartedCount).toBe(1);
      expect(result.value.statistics.completionRate).toBe(0.6); // 3/5
      expect(result.value.statistics.averageScore).toBe(85); // (85 + 92 + 78) / 3
      expect(result.value.statistics.highestScore).toBe(92);
      expect(result.value.statistics.lowestScore).toBe(78);
    }
  });

  it('Calculate statistics with single completed participant', async () => {
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

    // And: a single completed participant exists
    await givenParticipantsExist(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'Participant 1',
        accessCode: 'CODE1',
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:30:00Z'),
        totalScore: 90,
        maxScore: 100,
        timeTakenMinutes: 30,
        createdAt: new Date('2025-01-01T10:00:00Z')
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: statistics should match the single participant
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.statistics.totalParticipants).toBe(1);
      expect(result.value.statistics.completedCount).toBe(1);
      expect(result.value.statistics.inProgressCount).toBe(0);
      expect(result.value.statistics.notStartedCount).toBe(0);
      expect(result.value.statistics.completionRate).toBe(1); // 1/1
      expect(result.value.statistics.averageScore).toBe(90);
      expect(result.value.statistics.highestScore).toBe(90);
      expect(result.value.statistics.lowestScore).toBe(90);
    }
  });

  it('Calculate statistics excluding participants without scores', async () => {
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

    // And: completed participants exist, but one without a score
    await givenParticipantsExist(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'Participant 1',
        accessCode: 'CODE1',
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:30:00Z'),
        totalScore: 80,
        maxScore: 100,
        timeTakenMinutes: 30,
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-2',
        identifier: 'Participant 2',
        accessCode: 'CODE2',
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:25:00Z'),
        // No totalScore provided
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-3',
        identifier: 'Participant 3',
        accessCode: 'CODE3',
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:35:00Z'),
        totalScore: 95,
        maxScore: 100,
        timeTakenMinutes: 35,
        createdAt: new Date('2025-01-01T10:00:00Z')
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: statistics should only include participants with scores
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.statistics.totalParticipants).toBe(3);
      expect(result.value.statistics.completedCount).toBe(3);
      expect(result.value.statistics.completionRate).toBe(1); // 3/3
      // Average should only include participants with scores: (80 + 95) / 2 = 87.5
      expect(result.value.statistics.averageScore).toBe(87.5);
      expect(result.value.statistics.highestScore).toBe(95);
      expect(result.value.statistics.lowestScore).toBe(80);
    }
  });

  it('Generate question analysis with basic correct answers', async () => {
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

    // And: completed participants exist with test content and answers
    const question1: Question = {
      id: 'q1',
      text: 'What is 2 + 2?',
      answers: [
        { id: 'a1', text: '3' },
        { id: 'a2', text: '4' },
        { id: 'a3', text: '5' }
      ],
      correctAnswerId: 'a2',
      tags: [],
      createdAt: new Date('2025-01-01T09:00:00Z'),
      updatedAt: new Date('2025-01-01T09:00:00Z')
    };

    const question2: Question = {
      id: 'q2',
      text: 'What is 3 * 3?',
      answers: [
        { id: 'a4', text: '6' },
        { id: 'a5', text: '9' },
        { id: 'a6', text: '12' }
      ],
      correctAnswerId: 'a5',
      tags: [],
      createdAt: new Date('2025-01-01T09:00:00Z'),
      updatedAt: new Date('2025-01-01T09:00:00Z')
    };

    const testContent: TestContentPackage = {
      id: 'content-1',
      templateId,
      sections: [
        {
          poolId: 'pool-1',
          poolName: 'Math Pool',
          points: 20, // 10 points per question (2 questions)
          questions: [question1, question2]
        }
      ],
      createdAt: new Date('2025-01-01T09:00:00Z')
    };

    await givenTestInstancesWithContent(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'Participant 1',
        accessCode: 'CODE1',
        testContent,
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:30:00Z'),
        answers: { q1: 'a2', q2: 'a5' }, // Both correct
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-2',
        identifier: 'Participant 2',
        accessCode: 'CODE2',
        testContent,
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:25:00Z'),
        answers: { q1: 'a2', q2: 'a4' }, // q1 correct, q2 incorrect
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-3',
        identifier: 'Participant 3',
        accessCode: 'CODE3',
        testContent,
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:35:00Z'),
        answers: { q1: 'a1', q2: 'a5' }, // q1 incorrect, q2 correct
        createdAt: new Date('2025-01-01T10:00:00Z')
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: question analysis should be calculated correctly
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.questionAnalysis).toHaveLength(2);

      // Find question 1 (sorted by content)
      const q1Analysis = result.value.questionAnalysis.find(q => q.questionId === 'q1');
      expect(q1Analysis).toBeDefined();
      if (q1Analysis) {
        expect(q1Analysis.questionContent).toBe('What is 2 + 2?');
        expect(q1Analysis.correctAnswer).toBe('4');
        expect(q1Analysis.points).toBe(10); // 20 points / 2 questions
        expect(q1Analysis.participantsCount).toBe(3);
        expect(q1Analysis.totalResponses).toBe(3);
        expect(q1Analysis.correctResponses).toBe(2); // Participants 1 and 2 got it right
        expect(q1Analysis.correctPercentage).toBeCloseTo(66.67, 1);
      }

      // Find question 2
      const q2Analysis = result.value.questionAnalysis.find(q => q.questionId === 'q2');
      expect(q2Analysis).toBeDefined();
      if (q2Analysis) {
        expect(q2Analysis.questionContent).toBe('What is 3 * 3?');
        expect(q2Analysis.correctAnswer).toBe('9');
        expect(q2Analysis.points).toBe(10);
        expect(q2Analysis.participantsCount).toBe(3);
        expect(q2Analysis.totalResponses).toBe(3);
        expect(q2Analysis.correctResponses).toBe(2); // Participants 1 and 3 got it right
        expect(q2Analysis.correctPercentage).toBeCloseTo(66.67, 1);
      }
    }
  });

  it('Generate question analysis with mixed correct/incorrect answers', async () => {
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

    // And: a question with mixed answers
    const question: Question = {
      id: 'q1',
      text: 'What is the capital of France?',
      answers: [
        { id: 'a1', text: 'London' },
        { id: 'a2', text: 'Paris' },
        { id: 'a3', text: 'Berlin' }
      ],
      correctAnswerId: 'a2',
      tags: [],
      createdAt: new Date('2025-01-01T09:00:00Z'),
      updatedAt: new Date('2025-01-01T09:00:00Z')
    };

    const testContent: TestContentPackage = {
      id: 'content-1',
      templateId,
      sections: [
        {
          poolId: 'pool-1',
          poolName: 'Geography Pool',
          points: 30,
          questions: [question]
        }
      ],
      createdAt: new Date('2025-01-01T09:00:00Z')
    };

    await givenTestInstancesWithContent(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'Participant 1',
        accessCode: 'CODE1',
        testContent,
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:30:00Z'),
        answers: { q1: 'a2' }, // Correct
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-2',
        identifier: 'Participant 2',
        accessCode: 'CODE2',
        testContent,
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:25:00Z'),
        answers: { q1: 'a1' }, // Incorrect
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-3',
        identifier: 'Participant 3',
        accessCode: 'CODE3',
        testContent,
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:35:00Z'),
        answers: { q1: 'a2' }, // Correct
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-4',
        identifier: 'Participant 4',
        accessCode: 'CODE4',
        testContent,
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:20:00Z'),
        answers: { q1: 'a3' }, // Incorrect
        createdAt: new Date('2025-01-01T10:00:00Z')
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: question analysis should show 50% correct (2 out of 4)
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.questionAnalysis).toHaveLength(1);
      const analysis = result.value.questionAnalysis[0];
      expect(analysis.questionId).toBe('q1');
      expect(analysis.participantsCount).toBe(4);
      expect(analysis.totalResponses).toBe(4);
      expect(analysis.correctResponses).toBe(2);
      expect(analysis.correctPercentage).toBe(50);
    }
  });

  it('Generate question analysis with participants having different questions', async () => {
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

    // And: participants have different questions (simulating pool materialization)
    const question1: Question = {
      id: 'q1',
      text: 'Question 1',
      answers: [
        { id: 'a1', text: 'Answer 1' },
        { id: 'a2', text: 'Answer 2' }
      ],
      correctAnswerId: 'a2',
      tags: [],
      createdAt: new Date('2025-01-01T09:00:00Z'),
      updatedAt: new Date('2025-01-01T09:00:00Z')
    };

    const question2: Question = {
      id: 'q2',
      text: 'Question 2',
      answers: [
        { id: 'a3', text: 'Answer 3' },
        { id: 'a4', text: 'Answer 4' }
      ],
      correctAnswerId: 'a4',
      tags: [],
      createdAt: new Date('2025-01-01T09:00:00Z'),
      updatedAt: new Date('2025-01-01T09:00:00Z')
    };

    const question3: Question = {
      id: 'q3',
      text: 'Question 3',
      answers: [
        { id: 'a5', text: 'Answer 5' },
        { id: 'a6', text: 'Answer 6' }
      ],
      correctAnswerId: 'a6',
      tags: [],
      createdAt: new Date('2025-01-01T09:00:00Z'),
      updatedAt: new Date('2025-01-01T09:00:00Z')
    };

    // Participant 1 has questions 1 and 2
    const testContent1: TestContentPackage = {
      id: 'content-1',
      templateId,
      sections: [
        {
          poolId: 'pool-1',
          poolName: 'Pool 1',
          points: 20,
          questions: [question1, question2]
        }
      ],
      createdAt: new Date('2025-01-01T09:00:00Z')
    };

    // Participant 2 has questions 2 and 3
    const testContent2: TestContentPackage = {
      id: 'content-2',
      templateId,
      sections: [
        {
          poolId: 'pool-1',
          poolName: 'Pool 1',
          points: 20,
          questions: [question2, question3]
        }
      ],
      createdAt: new Date('2025-01-01T09:00:00Z')
    };

    await givenTestInstancesWithContent(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'Participant 1',
        accessCode: 'CODE1',
        testContent: testContent1,
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:30:00Z'),
        answers: { q1: 'a2', q2: 'a4' }, // Both correct
        createdAt: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'participant-2',
        identifier: 'Participant 2',
        accessCode: 'CODE2',
        testContent: testContent2,
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:25:00Z'),
        answers: { q2: 'a3', q3: 'a6' }, // q2 incorrect, q3 correct
        createdAt: new Date('2025-01-01T10:00:00Z')
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: question analysis should aggregate across all questions
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Should have 3 unique questions
      expect(result.value.questionAnalysis).toHaveLength(3);

      // Question 1: only participant 1 saw it, got it correct
      const q1Analysis = result.value.questionAnalysis.find(q => q.questionId === 'q1');
      expect(q1Analysis).toBeDefined();
      if (q1Analysis) {
        expect(q1Analysis.participantsCount).toBe(1);
        expect(q1Analysis.totalResponses).toBe(1);
        expect(q1Analysis.correctResponses).toBe(1);
        expect(q1Analysis.correctPercentage).toBe(100);
      }

      // Question 2: both participants saw it, 1 correct, 1 incorrect
      const q2Analysis = result.value.questionAnalysis.find(q => q.questionId === 'q2');
      expect(q2Analysis).toBeDefined();
      if (q2Analysis) {
        expect(q2Analysis.participantsCount).toBe(2);
        expect(q2Analysis.totalResponses).toBe(2);
        expect(q2Analysis.correctResponses).toBe(1);
        expect(q2Analysis.correctPercentage).toBe(50);
      }

      // Question 3: only participant 2 saw it, got it correct
      const q3Analysis = result.value.questionAnalysis.find(q => q.questionId === 'q3');
      expect(q3Analysis).toBeDefined();
      if (q3Analysis) {
        expect(q3Analysis.participantsCount).toBe(1);
        expect(q3Analysis.totalResponses).toBe(1);
        expect(q3Analysis.correctResponses).toBe(1);
        expect(q3Analysis.correctPercentage).toBe(100);
      }
    }
  });

  it('Return empty question analysis when no participants completed', async () => {
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

    // And: participants exist but none are completed
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
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: question analysis should be empty
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.questionAnalysis).toEqual([]);
    }
  });

  it('Handle questions with no responses (skipped)', async () => {
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

    // And: a participant completed but didn't answer all questions
    const question: Question = {
      id: 'q1',
      text: 'Question 1',
      answers: [
        { id: 'a1', text: 'Answer 1' },
        { id: 'a2', text: 'Answer 2' }
      ],
      correctAnswerId: 'a2',
      tags: [],
      createdAt: new Date('2025-01-01T09:00:00Z'),
      updatedAt: new Date('2025-01-01T09:00:00Z')
    };

    const testContent: TestContentPackage = {
      id: 'content-1',
      templateId,
      sections: [
        {
          poolId: 'pool-1',
          poolName: 'Pool 1',
          points: 10,
          questions: [question]
        }
      ],
      createdAt: new Date('2025-01-01T09:00:00Z')
    };

    await givenTestInstancesWithContent(testInstanceRepo, sessionId, [
      {
        id: 'participant-1',
        identifier: 'Participant 1',
        accessCode: 'CODE1',
        testContent,
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T10:30:00Z'),
        answers: {}, // No answers provided
        createdAt: new Date('2025-01-01T10:00:00Z')
      }
    ]);

    // When: fetching the session report
    const result = await module.getSessionReport(sessionId);

    // Then: question should be included but with 0 responses
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.questionAnalysis).toHaveLength(1);
      const analysis = result.value.questionAnalysis[0];
      expect(analysis.questionId).toBe('q1');
      expect(analysis.participantsCount).toBe(1); // Participant saw the question
      expect(analysis.totalResponses).toBe(0); // But didn't answer
      expect(analysis.correctResponses).toBe(0);
      expect(analysis.correctPercentage).toBe(0);
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
    totalScore?: number;
    maxScore?: number;
    timeTakenMinutes?: number;
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
      createdAt: participant.createdAt ?? baseDate,
      totalScore: participant.totalScore,
      maxScore: participant.maxScore,
      timeTakenMinutes: participant.timeTakenMinutes
    };
    await testInstanceRepo.save(instance);
  }
};

const givenTestInstancesWithContent = async (
  testInstanceRepo: TestInstanceRepository,
  sessionId: string,
  instances: Array<{
    id: string;
    identifier: string;
    accessCode: string;
    testContent: TestContentPackage;
    startedAt?: Date;
    completedAt?: Date;
    answers?: Record<string, string>;
    createdAt?: Date;
    totalScore?: number;
    maxScore?: number;
    timeTakenMinutes?: number;
  }>
): Promise<void> => {
  const baseDate = new Date('2025-01-01T10:00:00Z');

  for (const instanceData of instances) {
    const instance: TestInstance = {
      id: instanceData.id,
      sessionId,
      identifier: instanceData.identifier,
      accessCode: instanceData.accessCode,
      testContent: instanceData.testContent,
      startedAt: instanceData.startedAt,
      completedAt: instanceData.completedAt,
      answers: instanceData.answers,
      createdAt: instanceData.createdAt ?? baseDate,
      totalScore: instanceData.totalScore,
      maxScore: instanceData.maxScore,
      timeTakenMinutes: instanceData.timeTakenMinutes
    };
    await testInstanceRepo.save(instance);
  }
};
