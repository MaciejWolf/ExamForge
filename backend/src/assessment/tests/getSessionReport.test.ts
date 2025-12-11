import { describe, it, expect } from 'vitest';
import { configureAssessmentModule, AssessmentModule } from '../index';
import { ok } from '../../shared/result';
import { TestContentPackage } from '../../design/types/testContentPackage';
import { TestSessionReport } from '../types/sessionReport';

describe('getSessionReport Use Case', () => {
  const module = givenAssessmentModule();

  it('Success: Returns hardcoded report with correct structure', async () => {
    // Arrange
    const sessionId = 'test-session-123';

    // Act
    const result = await module.getSessionReport(sessionId);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      const report = result.value;
      thenReportShouldHaveCorrectStructure(report, sessionId);
    }
  });

  it('Success: Uses provided sessionId in response', async () => {
    // Arrange
    const sessionId = 'custom-session-id-456';

    // Act
    const result = await module.getSessionReport(sessionId);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.session.id).toBe(sessionId);
      // Verify all participants reference the correct sessionId
      result.value.participants.forEach(participant => {
        expect(participant.sessionId).toBe(sessionId);
      });
    }
  });

  it('Success: Returns report with all required fields', async () => {
    // Arrange
    const sessionId = 'test-session-789';

    // Act
    const result = await module.getSessionReport(sessionId);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      const report = result.value;
      
      // Verify session object
      expect(report.session).toBeDefined();
      expect(report.session.id).toBe(sessionId);
      expect(report.session.templateId).toBeDefined();
      expect(report.session.templateName).toBeDefined();
      expect(report.session.examinerId).toBeDefined();
      expect(report.session.timeLimitMinutes).toBeDefined();
      expect(report.session.status).toBeDefined();
      expect(report.session.createdAt).toBeDefined();
      
      // Verify participants array
      expect(report.participants).toBeDefined();
      expect(Array.isArray(report.participants)).toBe(true);
      expect(report.participants.length).toBeGreaterThan(0);
      
      // Verify statistics object
      expect(report.statistics).toBeDefined();
      expect(typeof report.statistics.averageScore).toBe('number');
      expect(typeof report.statistics.highestScore).toBe('number');
      expect(typeof report.statistics.lowestScore).toBe('number');
      expect(typeof report.statistics.completionRate).toBe('number');
      expect(typeof report.statistics.completedCount).toBe('number');
      expect(typeof report.statistics.inProgressCount).toBe('number');
      expect(typeof report.statistics.notStartedCount).toBe('number');
      expect(typeof report.statistics.totalParticipants).toBe('number');
      
      // Verify questionAnalysis array
      expect(report.questionAnalysis).toBeDefined();
      expect(Array.isArray(report.questionAnalysis)).toBe(true);
      expect(report.questionAnalysis.length).toBeGreaterThan(0);
    }
  });

  it('Success: Returns participants with varying statuses', async () => {
    // Arrange
    const sessionId = 'test-session-statuses';

    // Act
    const result = await module.getSessionReport(sessionId);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      const statuses = result.value.participants.map(p => p.status);
      const uniqueStatuses = new Set(statuses);
      
      // Should have at least completed, in_progress, and not_started
      expect(uniqueStatuses.size).toBeGreaterThanOrEqual(2);
      expect(statuses).toContain('completed');
    }
  });

  it('Success: Statistics match participant data', async () => {
    // Arrange
    const sessionId = 'test-session-stats';

    // Act
    const result = await module.getSessionReport(sessionId);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      const report = result.value;
      
      // Verify total participants matches
      expect(report.statistics.totalParticipants).toBe(report.participants.length);
      
      // Verify completion counts match
      const completedCount = report.participants.filter(p => p.status === 'completed').length;
      const inProgressCount = report.participants.filter(p => p.status === 'in_progress').length;
      const notStartedCount = report.participants.filter(p => p.status === 'not_started').length;
      
      expect(report.statistics.completedCount).toBe(completedCount);
      expect(report.statistics.inProgressCount).toBe(inProgressCount);
      expect(report.statistics.notStartedCount).toBe(notStartedCount);
    }
  });
});

// --- Test Helpers ---

const givenAssessmentModule = (): AssessmentModule => {
  return configureAssessmentModule({
    materializeTemplate: async () => ok({} as TestContentPackage),
    templateProvider: {
      getTemplateNames: async (ids) => {
        const names = new Map<string, string>();
        ids.forEach(id => names.set(id, `Template ${id}`));
        return names;
      }
    }
  });
};

const thenReportShouldHaveCorrectStructure = (
  report: TestSessionReport,
  expectedSessionId: string
) => {
  // Verify session structure
  expect(report.session.id).toBe(expectedSessionId);
  expect(report.session.templateId).toBe('template-123');
  expect(report.session.templateName).toBe('Mathematics Assessment - Advanced');
  expect(report.session.examinerId).toBe('examiner-456');
  expect(report.session.timeLimitMinutes).toBe(60);
  expect(['active', 'completed', 'cancelled', 'in_progress', 'expired']).toContain(report.session.status);
  expect(report.session.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  
  // Verify participants structure
  expect(report.participants.length).toBeGreaterThanOrEqual(3);
  report.participants.forEach(participant => {
    expect(participant.id).toBeDefined();
    expect(participant.sessionId).toBe(expectedSessionId);
    expect(participant.identifier).toBeDefined();
    expect(participant.accessCode).toBeDefined();
    expect(['not_started', 'in_progress', 'completed', 'timed_out']).toContain(participant.status);
    expect(participant.createdAt).toBeDefined();
  });
  
  // Verify statistics structure
  expect(report.statistics.totalParticipants).toBe(report.participants.length);
  expect(report.statistics.averageScore).toBeGreaterThanOrEqual(0);
  expect(report.statistics.highestScore).toBeGreaterThanOrEqual(report.statistics.lowestScore);
  expect(report.statistics.completionRate).toBeGreaterThanOrEqual(0);
  expect(report.statistics.completionRate).toBeLessThanOrEqual(1);
  
  // Verify questionAnalysis structure
  expect(report.questionAnalysis.length).toBeGreaterThanOrEqual(3);
  report.questionAnalysis.forEach(analysis => {
    expect(analysis.questionId).toBeDefined();
    expect(analysis.questionNumber).toBeGreaterThan(0);
    expect(analysis.questionContent).toBeDefined();
    expect(analysis.correctAnswer).toBeDefined();
    expect(analysis.points).toBeGreaterThan(0);
    expect(analysis.correctResponses).toBeGreaterThanOrEqual(0);
    expect(analysis.totalResponses).toBeGreaterThanOrEqual(0);
    expect(analysis.correctPercentage).toBeGreaterThanOrEqual(0);
    expect(analysis.correctPercentage).toBeLessThanOrEqual(100);
    expect(analysis.participantsCount).toBeGreaterThanOrEqual(0);
  });
};
