import { ParticipantSeed, ActiveSessionSeed } from './activeSessions';

export type CompletedSessionSeed = ActiveSessionSeed & {
  status: 'completed' | 'aborted';
  abortTime?: Date; // For aborted sessions, when they were aborted
};

/**
 * Completed test session seed data.
 * These sessions are in the past (both startTime and endTime in the past).
 * Status can be 'completed' (all participants finished) or 'aborted' (session terminated early).
 * Each participant has a deterministic seed for question selection.
 */
export const completedSessions: CompletedSessionSeed[] = [
  {
    templateName: 'General Science Assessment',
    startTime: (() => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 7); // 7 days ago
      start.setHours(9, 0, 0, 0);
      return start;
    })(),
    endTime: (() => {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() - 7); // 7 days ago
      end.setHours(11, 0, 0, 0);
      return end;
    })(),
    timeLimitMinutes: 120,
    examinerId: 'examiner-001',
    status: 'completed',
    participants: [
      {
        name: 'Alice Johnson',
        seed: 'alice-sci-past-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 100,
      },
      {
        name: 'Bob Martinez',
        seed: 'bob-sci-past-001',
        startTimeOffsetMinutes: 10,
        completionPercentage: 100,
      },
      {
        name: 'Carol Wong',
        seed: 'carol-sci-past-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 100,
      },
      {
        name: 'David Smith',
        seed: 'david-sci-past-001',
        startTimeOffsetMinutes: 20,
        completionPercentage: 100,
      },
    ],
  },
  {
    templateName: 'STEM Fundamentals',
    startTime: (() => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 3); // 3 days ago
      start.setHours(13, 0, 0, 0);
      return start;
    })(),
    endTime: (() => {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() - 3); // 3 days ago
      end.setHours(15, 30, 0, 0);
      return end;
    })(),
    timeLimitMinutes: 150,
    examinerId: 'examiner-002',
    status: 'completed',
    participants: [
      {
        name: 'Emma Davis',
        seed: 'emma-stem-past-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 100,
      },
      {
        name: 'Frank Lee',
        seed: 'frank-stem-past-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 100,
      },
      {
        name: 'Grace Kim',
        seed: 'grace-stem-past-001',
        startTimeOffsetMinutes: 5,
        completionPercentage: 100,
      },
    ],
  },
  {
    templateName: 'Modern History Challenge',
    startTime: (() => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 5); // 5 days ago
      start.setHours(8, 0, 0, 0);
      return start;
    })(),
    endTime: (() => {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() - 5); // 5 days ago
      end.setHours(12, 0, 0, 0);
      return end;
    })(),
    timeLimitMinutes: 240,
    examinerId: 'examiner-003',
    status: 'completed',
    participants: [
      {
        name: 'Jack Wilson',
        seed: 'jack-hist-past-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 100,
      },
      {
        name: 'Karen Taylor',
        seed: 'karen-hist-past-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 100,
      },
      {
        name: 'Leo Anderson',
        seed: 'leo-hist-past-001',
        startTimeOffsetMinutes: 30,
        completionPercentage: 100,
      },
      {
        name: 'Maria Chen',
        seed: 'maria-hist-past-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 100,
      },
      {
        name: 'Noah Patel',
        seed: 'noah-hist-past-001',
        startTimeOffsetMinutes: 15,
        completionPercentage: 100,
      },
    ],
  },
  {
    templateName: 'The Polymath General Knowledge',
    startTime: (() => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 2); // 2 days ago
      start.setHours(10, 0, 0, 0);
      return start;
    })(),
    endTime: (() => {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() - 2); // 2 days ago
      end.setHours(13, 0, 0, 0);
      return end;
    })(),
    timeLimitMinutes: 180,
    examinerId: 'examiner-001',
    status: 'aborted',
    abortTime: (() => {
      const now = new Date();
      const abort = new Date(now);
      abort.setDate(abort.getDate() - 2); // 2 days ago
      abort.setHours(11, 30, 0, 0);
      return abort;
    })(),
    participants: [
      {
        name: 'Oliver Scott',
        seed: 'oliver-poly-abort-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 65,
      },
      {
        name: 'Penelope Reed',
        seed: 'penelope-poly-abort-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 70,
      },
      {
        name: 'Quinn Morgan',
        seed: 'quinn-poly-abort-001',
        startTimeOffsetMinutes: 10,
        completionPercentage: 55,
      },
      {
        name: 'Rachel Foster',
        seed: 'rachel-poly-abort-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 60,
      },
    ],
  },
];
