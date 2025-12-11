export type ParticipantSeed = {
  name: string;
  seed: string;
  startTimeOffsetMinutes: number;
  completionPercentage: number;
};

export type ActiveSessionSeed = {
  templateName: string;
  startTime: Date;
  endTime: Date;
  timeLimitMinutes: number;
  examinerId: string;
  participants: ParticipantSeed[];
};

/**
 * Active test session seed data.
 * These sessions are currently running (startTime in past, endTime in future).
 * Each participant has a deterministic seed for question selection.
 */
export const activeSessions: ActiveSessionSeed[] = [
  {
    templateName: 'General Science Assessment',
    startTime: (() => {
      const now = new Date();
      const start = new Date(now);
      start.setHours(9, 0, 0, 0);
      start.setMinutes(start.getMinutes() - 120); // 2 hours ago
      return start;
    })(),
    endTime: (() => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(11, 0, 0, 0);
      return end;
    })(),
    timeLimitMinutes: 120,
    examinerId: 'examiner-001',
    participants: [
      {
        name: 'Alice Johnson',
        seed: 'alice-sci-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 60,
      },
      {
        name: 'Bob Martinez',
        seed: 'bob-sci-001',
        startTimeOffsetMinutes: 15,
        completionPercentage: 45,
      },
      {
        name: 'Carol Wong',
        seed: 'carol-sci-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 75,
      },
      {
        name: 'David Smith',
        seed: 'david-sci-001',
        startTimeOffsetMinutes: 30,
        completionPercentage: 30,
      },
    ],
  },
  {
    templateName: 'STEM Fundamentals',
    startTime: (() => {
      const now = new Date();
      const start = new Date(now);
      start.setHours(13, 0, 0, 0);
      start.setMinutes(start.getMinutes() - 30); // 30 minutes ago
      return start;
    })(),
    endTime: (() => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(15, 30, 0, 0);
      return end;
    })(),
    timeLimitMinutes: 150,
    examinerId: 'examiner-002',
    participants: [
      {
        name: 'Emma Davis',
        seed: 'emma-stem-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 20,
      },
      {
        name: 'Frank Lee',
        seed: 'frank-stem-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 25,
      },
      {
        name: 'Grace Kim',
        seed: 'grace-stem-001',
        startTimeOffsetMinutes: 5,
        completionPercentage: 18,
      },
      {
        name: 'Henry Brown',
        seed: 'henry-stem-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 22,
      },
      {
        name: 'Isabel Garcia',
        seed: 'isabel-stem-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 5,
      },
    ],
  },
  {
    templateName: 'Modern History Challenge',
    startTime: (() => {
      const now = new Date();
      const start = new Date(now);
      start.setHours(8, 0, 0, 0);
      start.setMinutes(start.getMinutes() - 180); // 3 hours ago
      return start;
    })(),
    endTime: (() => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(12, 0, 0, 0);
      return end;
    })(),
    timeLimitMinutes: 240,
    examinerId: 'examiner-003',
    participants: [
      {
        name: 'Jack Wilson',
        seed: 'jack-hist-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 85,
      },
      {
        name: 'Karen Taylor',
        seed: 'karen-hist-001',
        startTimeOffsetMinutes: 0,
        completionPercentage: 90,
      },
      {
        name: 'Leo Anderson',
        seed: 'leo-hist-001',
        startTimeOffsetMinutes: 60,
        completionPercentage: 55,
      },
    ],
  },
];
