import { describe, it, expect, beforeEach } from 'vitest';
import { configureAssessmentModule, AssessmentModule } from '../index';
import { ok } from '../../shared/result';
import { TestContentPackage } from '../../design/types/testContentPackage';

describe('listSessions Use Case', () => {
  let module: AssessmentModule;
  let idCounter: number;

  beforeEach(() => {
    idCounter = 0;
    module = configureAssessmentModule({
      materializeTemplate: async () => ok({} as TestContentPackage),
      idGenerator: () => `session-${++idCounter}`,
      now: () => new Date('2025-01-01T10:00:00Z'),
      templateProvider: {
        getTemplateNames: async (ids) => {
          const names = new Map<string, string>();
          ids.forEach(id => names.set(id, `Template ${id}`));
          return names;
        }
      }
    });
  });

  it('Success: List All Sessions', async () => {
    // Arrange - Create 3 sessions
    await givenSessionExists('template-1');
    await givenSessionExists('template-2');
    await givenSessionExists('template-3');

    // Act
    const sessions = await module.listSessions();

    // Assert
    expect(sessions).toHaveLength(3);
    expect(sessions[0].templateId).toBe('template-1');
    expect(sessions[0].templateName).toBe('Template template-1');
    expect(sessions[0].participantCount).toBe(2);
    expect(sessions[1].templateId).toBe('template-2');
    expect(sessions[1].templateName).toBe('Template template-2');
    expect(sessions[2].templateId).toBe('template-3');
  });

  it('Success: Empty List', async () => {
    // Arrange - Repository is empty (no sessions created)

    // Act
    const sessions = await module.listSessions();

    // Assert
    expect(sessions).toHaveLength(0);
    expect(sessions).toEqual([]);
  });

  // Helper function to create sessions in the repository
  const givenSessionExists = async (templateId: string) => {
    await module.startSession({
      templateId,
      examinerId: 'examiner-1',
      timeLimitMinutes: 60,
      startTime: new Date('2025-01-01T10:00:00Z'),
      endTime: new Date('2025-01-01T12:00:00Z'),
      participantIdentifiers: ['Alice', 'Bob'] });
  };
});
