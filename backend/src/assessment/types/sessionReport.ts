export type Participant = {
  id: string;
  sessionId: string;
  identifier: string;
  accessCode: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'timed_out';
  startedAt?: string;
  completedAt?: string;
  timeTakenMinutes?: number;
  totalScore?: number;
  maxScore?: number;
  createdAt: string;
};

export type SessionStatistics = {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completionRate: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  totalParticipants: number;
};

export type QuestionAnalysis = {
  questionId: string;
  questionNumber: number;
  questionContent: string;
  correctAnswer: string;
  points: number;
  correctResponses: number;
  totalResponses: number;
  correctPercentage: number;
  participantsCount: number;
};

export type ParticipantAnswer = {
  questionId: string;
  selectedAnswerId: string | null;
  isCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
};

export type TestSessionReport = {
  session: {
    id: string;
    templateId: string;
    templateName: string;
    examinerId: string;
    timeLimitMinutes: number;
    status: 'active' | 'completed' | 'cancelled' | 'in_progress' | 'expired';
    createdAt: string;
  };
  participants: Participant[];
  statistics: SessionStatistics;
  questionAnalysis: QuestionAnalysis[];
};
