export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type Tag = string;

export interface BankQuestion {
  id: string;
  text: string;
  answers: Array<{
    id: string;
    text: string;
  }>;
  correctAnswerId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankQuestionRequest {
  text: string;
  answers: Array<{
    id: string;
    text: string;
  }>;
  correctAnswerId: string;
  tags?: string[];
}

export interface UpdateBankQuestionRequest {
  text?: string;
  answers?: Array<{
    id: string;
    text: string;
  }>;
  correctAnswerId?: string;
  tags?: string[];
}

export interface Question {
  id: string;
  pool_id: string;
  content: string;
  answers: Answer[];
  createdAt: string;
}

export interface CreateQuestionRequest {
  content: string;
  answers: Omit<Answer, 'id'>[];
}

export interface UpdateQuestionRequest {
  content: string;
  answers: Omit<Answer, 'id'>[];
}

export interface Pool {
  id: string;
  name: string;
  questionsToDraw: number;
  points: number;
  questionIds: string[];
}

export interface TestTemplate {
  id: string;
  name: string;
  description?: string;
  pools: Pool[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  pools: Omit<Pool, 'id'>[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  pools?: Omit<Pool, 'id'>[];
}

export interface Participant {
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
}

export interface SessionStatistics {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completionRate: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  totalParticipants: number;
}

export interface QuestionAnalysis {
  questionId: string;
  questionNumber: number;
  questionContent: string;
  correctAnswer: string;
  points: number;
  correctResponses: number;
  totalResponses: number;
  correctPercentage: number;
  participantsCount: number;
}

export interface TestSession {
  id: string;
  templateId: string;
  examinerId: string;
  timeLimitMinutes: number;
  status: 'active' | 'completed' | 'cancelled' | 'in_progress' | 'expired';
  createdAt: string;
}

export interface TestSessionDetail {
  id: string;
  templateId: string;
  templateName?: string;
  examinerId: string;
  timeLimitMinutes: number;
  status: 'active' | 'completed' | 'cancelled' | 'in_progress' | 'expired';
  createdAt: string;
  participantCount?: number;
}

export interface TestSessionReport {
  session: TestSession & { templateName?: string };
  participants: Participant[];
  statistics: SessionStatistics;
  questionAnalysis: QuestionAnalysis[];
}

export interface ParticipantAnswer {
  questionId: string;
  selectedAnswerId: string | null;
  isCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
}

export interface ParticipantDetail {
  participant: Participant;
  answers: ParticipantAnswer[];
  questions: Question[];
}

export interface CreateSessionRequest {
  templateId: string;
  examinerId: string;
  timeLimitMinutes: number;
  participantIdentifiers: string[];
  startTime: Date; // ISO 8601 datetime string
  endTime: Date; // ISO 8601 datetime string
}

export interface CreateSessionResponse {
  sessionId: string;
}
