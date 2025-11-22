import { supabase } from '@/lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface QuestionPool {
  id: string;
  name: string;
  questionCount: number;
  createdAt: string;
}

export interface CreatePoolRequest {
  name: string;
}

export interface UpdatePoolRequest {
  name: string;
}

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

export interface PoolSelection {
  poolId: string;
  questionsToDraw: number;
  points: number;
}

export interface TestTemplate {
  id: string;
  name: string;
  examiner_id: string;
  poolSelections: PoolSelection[];
  createdAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  poolSelections: PoolSelection[];
}

export interface UpdateTemplateRequest {
  name: string;
  poolSelections: PoolSelection[];
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

export interface TestSessionReport {
  session: TestSession & { template_name: string };
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

export interface TestSession {
  id: string;
  template_id: string;
  examiner_id: string;
  time_limit_minutes: number;
  status: 'active' | 'completed' | 'cancelled' | 'in_progress' | 'expired';
  createdAt: string;
}

export interface TestSessionDetail {
  id: string;
  template_id: string;
  template_name: string;
  examiner_id: string;
  time_limit_minutes: number;
  status: 'active' | 'completed' | 'cancelled' | 'in_progress' | 'expired';
  createdAt: string;
  participant_count: number;
}

export interface CreateSessionRequest {
  templateId: string;
  timeLimitMinutes: number;
  participants: string[];
}

export interface CreateSessionResponse {
  session: TestSession;
  participants: Participant[];
}

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const questionPoolsApi = {
  async getAll(): Promise<{ pools: QuestionPool[] }> {
    return apiRequest<{ pools: QuestionPool[] }>('/question-pools');
  },

  async create(data: CreatePoolRequest): Promise<QuestionPool> {
    return apiRequest<QuestionPool>('/question-pools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdatePoolRequest): Promise<QuestionPool> {
    return apiRequest<QuestionPool>(`/question-pools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/question-pools/${id}`, {
      method: 'DELETE',
    });
  },
};

export const questionsApi = {
  async getByPool(poolId: string): Promise<{ questions: Question[] }> {
    return apiRequest<{ questions: Question[] }>(`/question-pools/${poolId}/questions`);
  },

  async create(poolId: string, data: CreateQuestionRequest): Promise<Question> {
    return apiRequest<Question>(`/question-pools/${poolId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(poolId: string, questionId: string, data: UpdateQuestionRequest): Promise<Question> {
    return apiRequest<Question>(`/question-pools/${poolId}/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(poolId: string, questionId: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/question-pools/${poolId}/questions/${questionId}`, {
      method: 'DELETE',
    });
  },
};

export const testTemplatesApi = {
  async getAll(): Promise<{ templates: TestTemplate[] }> {
    return apiRequest<{ templates: TestTemplate[] }>('/test-templates');
  },

  async getById(id: string): Promise<TestTemplate> {
    return apiRequest<TestTemplate>(`/test-templates/${id}`);
  },

  async create(data: CreateTemplateRequest): Promise<TestTemplate> {
    return apiRequest<TestTemplate>('/test-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateTemplateRequest): Promise<TestTemplate> {
    return apiRequest<TestTemplate>(`/test-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/test-templates/${id}`, {
      method: 'DELETE',
    });
  },
};

export const testSessionsApi = {
  async create(data: CreateSessionRequest): Promise<CreateSessionResponse> {
    return apiRequest<CreateSessionResponse>('/test-sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<{ sessions: TestSessionDetail[] }> {
    return apiRequest<{ sessions: TestSessionDetail[] }>('/test-sessions');
  },

  async getById(id: string): Promise<{ session: TestSession; participants: Participant[] }> {
    return apiRequest<{ session: TestSession; participants: Participant[] }>(`/test-sessions/${id}`);
  },

  async getReport(sessionId: string): Promise<TestSessionReport> {
    return apiRequest<TestSessionReport>(`/test-sessions/${sessionId}/report`);
  },

  async getParticipantDetails(sessionId: string, participantId: string): Promise<ParticipantDetail> {
    return apiRequest<ParticipantDetail>(`/test-sessions/${sessionId}/participants/${participantId}`);
  },
};

// Helper function to convert Date objects to ISO strings
const convertQuestionDates = (question: {
  createdAt: Date | string;
  updatedAt: Date | string;
  [key: string]: unknown;
}): BankQuestion => {
  return {
    ...question,
    createdAt: typeof question.createdAt === 'string' 
      ? question.createdAt 
      : question.createdAt.toISOString(),
    updatedAt: typeof question.updatedAt === 'string' 
      ? question.updatedAt 
      : question.updatedAt.toISOString(),
  } as BankQuestion;
};

export const questionBankApi = {
  async getAll(): Promise<BankQuestion[]> {
    const questions = await apiRequest<Array<{
      id: string;
      text: string;
      answers: Array<{ id: string; text: string }>;
      correctAnswerId: string;
      tags: string[];
      createdAt: Date | string;
      updatedAt: Date | string;
    }>>('/design/questions');
    return questions.map(convertQuestionDates);
  },

  async create(data: CreateBankQuestionRequest): Promise<BankQuestion> {
    const question = await apiRequest<{
      id: string;
      text: string;
      answers: Array<{ id: string; text: string }>;
      correctAnswerId: string;
      tags: string[];
      createdAt: Date | string;
      updatedAt: Date | string;
    }>('/design/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return convertQuestionDates(question);
  },

  async update(id: string, data: UpdateBankQuestionRequest): Promise<BankQuestion> {
    const question = await apiRequest<{
      id: string;
      text: string;
      answers: Array<{ id: string; text: string }>;
      correctAnswerId: string;
      tags: string[];
      createdAt: Date | string;
      updatedAt: Date | string;
    }>(`/design/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return convertQuestionDates(question);
  },

  async delete(id: string): Promise<void> {
    await apiRequest<{ message: string }>(`/design/questions/${id}`, {
      method: 'DELETE',
    });
  },
};

