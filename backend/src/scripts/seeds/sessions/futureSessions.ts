import { ParticipantSeed, ActiveSessionSeed } from './activeSessions';

export type FutureSessionSeed = ActiveSessionSeed;

/**
 * Future test session seed data.
 * These sessions are scheduled for the future (both startTime and endTime in the future).
 * Status will be 'open' (scheduled but not started).
 * Each participant has a deterministic seed for question selection.
 * All participants have 0% completion (sessions haven't started yet).
 */
export const futureSessions: FutureSessionSeed[] = [
  {
    templateName: 'General Science Assessment',
    startTime: (() => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() + 1); // Tomorrow
      start.setHours(9, 0, 0, 0);
      return start;
    })(),
    endTime: (() => {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() + 1); // Tomorrow
      end.setHours(11, 0, 0, 0);
      return end;
    })(),
    timeLimitMinutes: 120,
    examinerId: 'examiner-001',
    participants: [
      {
        name: 'Alice Johnson',
        seed: 'alice-sci-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
      {
        name: 'Bob Martinez',
        seed: 'bob-sci-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
      {
        name: 'Carol Wong',
        seed: 'carol-sci-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
      {
        name: 'David Smith',
        seed: 'david-sci-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
      {
        name: 'Emma Davis',
        seed: 'emma-sci-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
    ],
  },
  {
    templateName: 'STEM Fundamentals',
    startTime: (() => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() + 7); // 7 days from now
      start.setHours(14, 0, 0, 0);
      return start;
    })(),
    endTime: (() => {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() + 7); // 7 days from now
      end.setHours(16, 30, 0, 0);
      return end;
    })(),
    timeLimitMinutes: 150,
    examinerId: 'examiner-002',
    participants: [
      {
        name: 'Frank Lee',
        seed: 'frank-stem-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
      {
        name: 'Grace Kim',
        seed: 'grace-stem-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
      {
        name: 'Henry Brown',
        seed: 'henry-stem-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
    ],
  },
  {
    templateName: 'Modern History Challenge',
    startTime: (() => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() + 30); // 30 days from now
      start.setHours(8, 0, 0, 0);
      return start;
    })(),
    endTime: (() => {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() + 30); // 30 days from now
      end.setHours(12, 0, 0, 0);
      return end;
    })(),
    timeLimitMinutes: 240,
    examinerId: 'examiner-003',
    participants: [
      {
        name: 'Isabel Garcia',
        seed: 'isabel-hist-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
      {
        name: 'Jack Wilson',
        seed: 'jack-hist-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
      {
        name: 'Karen Taylor',
        seed: 'karen-hist-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
      {
        name: 'Leo Anderson',
        seed: 'leo-hist-future-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 0,
      },
    ],
  },
];
