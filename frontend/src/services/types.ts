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
  session_id: string;
  identifier: string;
  access_code: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'timed_out';
  started_at?: string;
  completed_at?: string;
  time_taken_minutes?: number;
  total_score?: number;
  max_score?: number;
  createdAt: string;
}

export interface SessionStatistics {
  average_score: number;
  highest_score: number;
  lowest_score: number;
  completion_rate: number;
  completed_count: number;
  in_progress_count: number;
  not_started_count: number;
  total_participants: number;
}

export interface QuestionAnalysis {
  question_id: string;
  question_number: number;
  question_content: string;
  correct_answer: string;
  points: number;
  correct_responses: number;
  total_responses: number;
  correct_percentage: number;
  participants_count: number;
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
  question_id: string;
  selected_answer_id: string | null;
  is_correct: boolean;
  points_earned: number;
  points_possible: number;
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
