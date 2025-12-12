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
    const result = await module.finishTestInstance(testInstanceId, undefined);

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
    const result = await module.finishTestInstance(testInstance.id, undefined);

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
    await module.finishTestInstance(testInstanceId, undefined);

    // When: Participant requests to finish the test again
    now = new Date('2024-01-01T10:05:00Z');
    const result = await module.finishTestInstance(testInstanceId, undefined);

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
    const result = await module.finishTestInstance(testInstanceId, undefined);

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
    const result = await module.finishTestInstance(testInstanceId, undefined);
    expect(result.ok).toBe(true);
  });

  it('should persist answers when finishing test with valid answers', async () => {
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

    // When: Finish test with answers
    now = new Date('2024-01-01T10:00:00Z');
    const answers = {
      'question-1': 'answer-a',
      'question-2': 'answer-b',
      'question-3': 'answer-c'
    };
    const result = await module.finishTestInstance(testInstanceId, answers);

    // Then: Answers should be persisted
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.answers).toEqual(answers);
      expect(result.value.completedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    }
  });

  it('should persist empty answers object when finishing test with empty answers', async () => {
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

    // When: Finish test with empty answers object
    now = new Date('2024-01-01T10:00:00Z');
    const result = await module.finishTestInstance(testInstanceId, {});

    // Then: Empty answers object should be persisted
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.answers).toEqual({});
      expect(result.value.completedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    }
  });

  it('should persist partial answers when finishing test with some questions unanswered', async () => {
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

    // When: Finish test with partial answers (only 2 out of 3 questions answered)
    now = new Date('2024-01-01T10:00:00Z');
    const answers = {
      'question-1': 'answer-a',
      'question-2': 'answer-b'
      // question-3 is unanswered
    };
    const result = await module.finishTestInstance(testInstanceId, answers);

    // Then: Partial answers should be persisted
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.answers).toEqual(answers);
      expect(result.value.completedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    }
  });

  it('should finish test without answers parameter (backward compatibility)', async () => {
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

    // When: Finish test without answers parameter
    now = new Date('2024-01-01T10:00:00Z');
    const result = await module.finishTestInstance(testInstanceId);

    // Then: Test should be finished, answers should be undefined
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.answers).toBeUndefined();
      expect(result.value.completedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    }
  });

  it('should persist answers atomically with completion status', async () => {
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

    // When: Finish test with answers
    now = new Date('2024-01-01T10:00:00Z');
    const answers = {
      'question-1': 'answer-a',
      'question-2': 'answer-b'
    };
    const result = await module.finishTestInstance(testInstanceId, answers);

    // Then: Both answers and completedAt should be set together
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.answers).toBeDefined();
      expect(result.value.completedAt).toBeDefined();
      expect(result.value.answers).toEqual(answers);
      expect(result.value.completedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    }

    // And: Verify persistence by fetching the instance again
    const sessionResult = await module.getSessionById(sessionId);
    expect(sessionResult.ok).toBe(true);
    if (sessionResult.ok) {
      const persistedInstance = sessionResult.value.instances.find(i => i.id === testInstanceId);
      expect(persistedInstance).toBeDefined();
      if (persistedInstance) {
        expect(persistedInstance.answers).toEqual(answers);
        expect(persistedInstance.completedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
      }
    }
  });

  // --- Score Calculation Tests ---

  it('should calculate totalScore equals maxScore when all answers are correct', async () => {
    // Given: Test content with 2 sections (10 points each, 2 questions each)
    const testContent = givenTestContentWithScoring();
    const { sessionId, module: scoringModule } = await givenSessionWithScoring({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
      testContent
    });

    const { id: testInstanceId } = await givenTestInstanceWithScoring({
      module: scoringModule,
      sessionId,
      startedAt: new Date('2024-01-01T09:30:00Z')
    });

    // When: Finish test with all correct answers
    now = new Date('2024-01-01T10:00:00Z');
    const answers = {
      'q1': 'q1-a', // correct
      'q2': 'q2-b', // correct
      'q3': 'q3-a', // correct
      'q4': 'q4-b'  // correct
    };
    const result = await scoringModule.finishTestInstance(testInstanceId, answers);

    // Then: totalScore should equal maxScore
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalScore).toBe(20);
      expect(result.value.maxScore).toBe(20);
      expect(result.value.totalScore).toBe(result.value.maxScore);
    }
  });

  it('should calculate totalScore as 0 when all answers are incorrect', async () => {
    // Given: Test content with 2 sections (10 points each, 2 questions each)
    const testContent = givenTestContentWithScoring();
    const { sessionId, module: scoringModule } = await givenSessionWithScoring({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
      testContent
    });

    const { id: testInstanceId } = await givenTestInstanceWithScoring({
      module: scoringModule,
      sessionId,
      startedAt: new Date('2024-01-01T09:30:00Z')
    });

    // When: Finish test with all incorrect answers
    now = new Date('2024-01-01T10:00:00Z');
    const answers = {
      'q1': 'q1-b', // wrong (correct is q1-a)
      'q2': 'q2-a', // wrong (correct is q2-b)
      'q3': 'q3-b', // wrong (correct is q3-a)
      'q4': 'q4-a'  // wrong (correct is q4-b)
    };
    const result = await scoringModule.finishTestInstance(testInstanceId, answers);

    // Then: totalScore should be 0, maxScore should be 20
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalScore).toBe(0);
      expect(result.value.maxScore).toBe(20);
    }
  });

  it('should calculate partial score when answers are mixed correct and incorrect', async () => {
    // Given: Test content with 2 sections (10 points each, 2 questions each)
    const testContent = givenTestContentWithScoring();
    const { sessionId, module: scoringModule } = await givenSessionWithScoring({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
      testContent
    });

    const { id: testInstanceId } = await givenTestInstanceWithScoring({
      module: scoringModule,
      sessionId,
      startedAt: new Date('2024-01-01T09:30:00Z')
    });

    // When: Finish test with 50% correct answers (2 out of 4)
    now = new Date('2024-01-01T10:00:00Z');
    const answers = {
      'q1': 'q1-a', // correct
      'q2': 'q2-a', // wrong (correct is q2-b)
      'q3': 'q3-a', // correct
      'q4': 'q4-a'  // wrong (correct is q4-b)
    };
    const result = await scoringModule.finishTestInstance(testInstanceId, answers);

    // Then: totalScore should be 10 (half of maxScore)
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalScore).toBe(10);
      expect(result.value.maxScore).toBe(20);
    }
  });

  it('should distribute points evenly across questions in a section', async () => {
    // Given: Test content with section having 10 points and 3 questions
    const testContent: TestContentPackage = {
      id: 'test-content-2',
      templateId: 'template-1',
      sections: [
        {
          poolId: 'pool-1',
          poolName: 'Section 1',
          points: 10,
          questions: [
            {
              id: 'q1',
              text: 'Question 1',
              answers: [
                { id: 'q1-a', text: 'Answer A' },
                { id: 'q1-b', text: 'Answer B' }
              ],
              correctAnswerId: 'q1-a',
              tags: [],
              createdAt: new Date('2024-01-01T09:00:00Z'),
              updatedAt: new Date('2024-01-01T09:00:00Z')
            },
            {
              id: 'q2',
              text: 'Question 2',
              answers: [
                { id: 'q2-a', text: 'Answer A' },
                { id: 'q2-b', text: 'Answer B' }
              ],
              correctAnswerId: 'q2-a',
              tags: [],
              createdAt: new Date('2024-01-01T09:00:00Z'),
              updatedAt: new Date('2024-01-01T09:00:00Z')
            },
            {
              id: 'q3',
              text: 'Question 3',
              answers: [
                { id: 'q3-a', text: 'Answer A' },
                { id: 'q3-b', text: 'Answer B' }
              ],
              correctAnswerId: 'q3-a',
              tags: [],
              createdAt: new Date('2024-01-01T09:00:00Z'),
              updatedAt: new Date('2024-01-01T09:00:00Z')
            }
          ]
        }
      ],
      createdAt: new Date('2024-01-01T09:00:00Z')
    };

    const { sessionId, module: scoringModule } = await givenSessionWithScoring({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
      testContent
    });

    const { id: testInstanceId } = await givenTestInstanceWithScoring({
      module: scoringModule,
      sessionId,
      startedAt: new Date('2024-01-01T09:30:00Z')
    });

    // When: Finish test with 1 correct answer out of 3
    now = new Date('2024-01-01T10:00:00Z');
    const answers = {
      'q1': 'q1-a', // correct - should award 10/3 ≈ 3.333 points
      'q2': 'q2-b', // wrong
      'q3': 'q3-b'  // wrong
    };
    const result = await scoringModule.finishTestInstance(testInstanceId, answers);

    // Then: totalScore should be approximately 3.333 (10/3)
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalScore).toBeCloseTo(10 / 3, 2);
      expect(result.value.maxScore).toBe(10);
    }
  });

  it('should calculate timeTakenMinutes correctly', async () => {
    // Given: Test content
    const testContent = givenTestContentWithScoring();
    const { sessionId, module: scoringModule } = await givenSessionWithScoring({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
      testContent
    });

    // And: Test instance started at 09:30
    const { id: testInstanceId } = await givenTestInstanceWithScoring({
      module: scoringModule,
      sessionId,
      startedAt: new Date('2024-01-01T09:30:00Z')
    });

    // When: Finish test at 10:00 (30 minutes later)
    now = new Date('2024-01-01T10:00:00Z');
    const answers = {
      'q1': 'q1-a',
      'q2': 'q2-b',
      'q3': 'q3-a',
      'q4': 'q4-b'
    };
    const result = await scoringModule.finishTestInstance(testInstanceId, answers);

    // Then: timeTakenMinutes should be 30
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.timeTakenMinutes).toBe(30);
    }
  });

  it('should calculate totalScore as 0 when answers object is empty', async () => {
    // Given: Test content
    const testContent = givenTestContentWithScoring();
    const { sessionId, module: scoringModule } = await givenSessionWithScoring({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
      testContent
    });

    const { id: testInstanceId } = await givenTestInstanceWithScoring({
      module: scoringModule,
      sessionId,
      startedAt: new Date('2024-01-01T09:30:00Z')
    });

    // When: Finish test with empty answers object
    now = new Date('2024-01-01T10:00:00Z');
    const result = await scoringModule.finishTestInstance(testInstanceId, {});

    // Then: totalScore should be 0, maxScore should be correct
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalScore).toBe(0);
      expect(result.value.maxScore).toBe(20);
    }
  });

  it('should only score answered questions when partial answers are provided', async () => {
    // Given: Test content
    const testContent = givenTestContentWithScoring();
    const { sessionId, module: scoringModule } = await givenSessionWithScoring({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
      testContent
    });

    const { id: testInstanceId } = await givenTestInstanceWithScoring({
      module: scoringModule,
      sessionId,
      startedAt: new Date('2024-01-01T09:30:00Z')
    });

    // When: Finish test with only 2 out of 4 questions answered correctly
    now = new Date('2024-01-01T10:00:00Z');
    const answers = {
      'q1': 'q1-a', // correct - 5 points
      'q2': 'q2-b'  // correct - 5 points
      // q3 and q4 unanswered
    };
    const result = await scoringModule.finishTestInstance(testInstanceId, answers);

    // Then: totalScore should be 10 (only answered questions scored)
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalScore).toBe(10);
      expect(result.value.maxScore).toBe(20);
    }
  });

  it('should not calculate scores when answers parameter is not provided', async () => {
    // Given: Test content
    const testContent = givenTestContentWithScoring();
    const { sessionId, module: scoringModule } = await givenSessionWithScoring({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
      testContent
    });

    const { id: testInstanceId } = await givenTestInstanceWithScoring({
      module: scoringModule,
      sessionId,
      startedAt: new Date('2024-01-01T09:30:00Z')
    });

    // When: Finish test without answers parameter
    now = new Date('2024-01-01T10:00:00Z');
    const result = await scoringModule.finishTestInstance(testInstanceId);

    // Then: Scores should not be calculated
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalScore).toBeUndefined();
      expect(result.value.maxScore).toBeUndefined();
      expect(result.value.timeTakenMinutes).toBeUndefined();
    }
  });

  it('should persist scores atomically with completion status', async () => {
    // Given: Test content
    const testContent = givenTestContentWithScoring();
    const { sessionId, module: scoringModule } = await givenSessionWithScoring({
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      testDurationMinutes: 60,
      testContent
    });

    const { id: testInstanceId } = await givenTestInstanceWithScoring({
      module: scoringModule,
      sessionId,
      startedAt: new Date('2024-01-01T09:30:00Z')
    });

    // When: Finish test with answers
    now = new Date('2024-01-01T10:00:00Z');
    const answers = {
      'q1': 'q1-a',
      'q2': 'q2-b',
      'q3': 'q3-a',
      'q4': 'q4-b'
    };
    const result = await scoringModule.finishTestInstance(testInstanceId, answers);

    // Then: All fields should be persisted together
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.answers).toBeDefined();
      expect(result.value.completedAt).toBeDefined();
      expect(result.value.totalScore).toBeDefined();
      expect(result.value.maxScore).toBeDefined();
      expect(result.value.timeTakenMinutes).toBeDefined();
    }

    // And: Verify persistence by fetching the instance again
    const sessionResult = await scoringModule.getSessionById(sessionId);
    expect(sessionResult.ok).toBe(true);
    if (sessionResult.ok) {
      const persistedInstance = sessionResult.value.instances.find(i => i.id === testInstanceId);
      expect(persistedInstance).toBeDefined();
      if (persistedInstance) {
        expect(persistedInstance.answers).toEqual(answers);
        expect(persistedInstance.completedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
        expect(persistedInstance.totalScore).toBe(20);
        expect(persistedInstance.maxScore).toBe(20);
        expect(persistedInstance.timeTakenMinutes).toBe(30);
      }
    }
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

  const givenTestContentWithScoring = (): TestContentPackage => ({
    id: 'test-content-1',
    templateId: 'template-1',
    sections: [
      {
        poolId: 'pool-1',
        poolName: 'Section 1',
        points: 10,
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            answers: [
              { id: 'q1-a', text: 'Answer A' },
              { id: 'q1-b', text: 'Answer B' }
            ],
            correctAnswerId: 'q1-a',
            tags: [],
            createdAt: new Date('2024-01-01T09:00:00Z'),
            updatedAt: new Date('2024-01-01T09:00:00Z')
          },
          {
            id: 'q2',
            text: 'Question 2',
            answers: [
              { id: 'q2-a', text: 'Answer A' },
              { id: 'q2-b', text: 'Answer B' }
            ],
            correctAnswerId: 'q2-b',
            tags: [],
            createdAt: new Date('2024-01-01T09:00:00Z'),
            updatedAt: new Date('2024-01-01T09:00:00Z')
          }
        ]
      },
      {
        poolId: 'pool-2',
        poolName: 'Section 2',
        points: 10,
        questions: [
          {
            id: 'q3',
            text: 'Question 3',
            answers: [
              { id: 'q3-a', text: 'Answer A' },
              { id: 'q3-b', text: 'Answer B' }
            ],
            correctAnswerId: 'q3-a',
            tags: [],
            createdAt: new Date('2024-01-01T09:00:00Z'),
            updatedAt: new Date('2024-01-01T09:00:00Z')
          },
          {
            id: 'q4',
            text: 'Question 4',
            answers: [
              { id: 'q4-a', text: 'Answer A' },
              { id: 'q4-b', text: 'Answer B' }
            ],
            correctAnswerId: 'q4-b',
            tags: [],
            createdAt: new Date('2024-01-01T09:00:00Z'),
            updatedAt: new Date('2024-01-01T09:00:00Z')
          }
        ]
      }
    ],
    createdAt: new Date('2024-01-01T09:00:00Z')
  });

  const givenAssessmentModuleWithScoring = (testContent: TestContentPackage): AssessmentModule => {
    let idCounter = 0;
    let accessCodeCounter = 0;

    return configureAssessmentModule({
      idGenerator: () => `test-id-${++idCounter}`,
      accessCodeGenerator: () => `TEST-${String(++accessCodeCounter).padStart(3, '0')}`,
      now: () => now,
      materializeTemplate: async (templateId: string) => {
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

  const givenSessionWithScoring = async (params: {
    startTime: Date;
    endTime: Date;
    testDurationMinutes: number;
    testContent: TestContentPackage;
  }): Promise<{ sessionId: string; module: AssessmentModule }> => {
    const scoringModule = givenAssessmentModuleWithScoring(params.testContent);

    const result = await scoringModule.startSession({
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

    return { sessionId: result.value, module: scoringModule };
  };

  const givenTestInstanceWithScoring = async (params: {
    module: AssessmentModule;
    sessionId: string;
    startedAt?: Date;
  }): Promise<TestInstance> => {
    // Set clock to startedAt time if provided
    if (params.startedAt) {
      now = params.startedAt;
    }

    // Access code is predictable from accessCodeGenerator
    const accessCode = 'TEST-001';

    const startResult = await params.module.startTestInstance(accessCode);
    if (!startResult.ok) {
      throw new Error(`Failed to start test instance: ${JSON.stringify(startResult.error)}`);
    }

    return startResult.value;
  };
});
