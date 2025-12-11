import { supabase } from '@/lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';


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

type ApiErrorData = {
  type?: string;
  message?: string;
  questionId?: string;
  templateIds?: string[];
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  errorData?: ApiErrorData;

  constructor(
    message: string,
    status: number,
    errorData?: ApiErrorData
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorData = errorData;
  }

  get isQuestionInUse(): boolean {
    return this.errorData?.type === 'QuestionInUse';
  }

  get templateIds(): string[] {
    return this.errorData?.templateIds || [];
  }
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
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    const errorMessage = errorData.error?.message || errorData.error || `HTTP error! status: ${response.status}`;
    throw new ApiError(errorMessage, response.status, errorData.error || errorData);
  }

  return response.json();
}


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
  async getAll(): Promise<TestTemplate[]> {
    const templates = await apiRequest<TestTemplate[]>('/design/templates');
    return templates.map(convertTemplateDates);
  },

  async getById(id: string): Promise<TestTemplate> {
    const template = await apiRequest<TestTemplate>(`/design/templates/${id}`);
    return convertTemplateDates(template);
  },

  async create(data: CreateTemplateRequest): Promise<TestTemplate> {
    const template = await apiRequest<TestTemplate>('/design/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return convertTemplateDates(template);
  },

  async update(id: string, data: UpdateTemplateRequest): Promise<TestTemplate> {
    const template = await apiRequest<TestTemplate>(`/design/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return convertTemplateDates(template);
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/design/templates/${id}`, {
      method: 'DELETE',
    });
  },
};

export const testSessionsApi = {
  async create(data: CreateSessionRequest): Promise<CreateSessionResponse> {
    return apiRequest<CreateSessionResponse>('/assessment/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<{ sessions: TestSessionDetail[] }> {
    const sessions = await apiRequest<Array<{
      id: string;
      templateId: string;
      templateName?: string;
      examinerId: string;
      timeLimitMinutes: number;
      startTime: string;
      endTime: string;
      status: 'open' | 'completed' | 'aborted';
      createdAt: string;
      updatedAt: string;
      participantCount?: number;
    }>>('/assessment/sessions');
    
    // Map backend status to frontend status
    const mappedSessions: TestSessionDetail[] = sessions.map((session) => ({
      ...session,
      status: session.status === 'open' ? 'active' : 
              session.status === 'aborted' ? 'cancelled' : 
              session.status,
    }));
    
    return { sessions: mappedSessions };
  },

  async getById(id: string): Promise<{ session: TestSession; participants: Participant[] }> {
    // Backend returns { session: TestSession, instances: TestInstance[] }
    // Map backend camelCase format to frontend snake_case format
    const backendResponse = await apiRequest<{
      session: {
        id: string;
        templateId: string;
        examinerId: string;
        timeLimitMinutes: number;
        startTime: string;
        endTime: string;
        status: 'open' | 'completed' | 'aborted';
        createdAt: string;
        updatedAt: string;
      };
      instances: Array<{
        id: string;
        sessionId: string;
        identifier: string;
        accessCode: string;
        testContent: unknown;
        startedAt?: string;
        completedAt?: string;
        totalScore?: number;
        createdAt: string;
      }>;
    }>(`/assessment/sessions/${id}`);

    // Map backend status to frontend status
    const mappedSession: TestSession = {
      ...backendResponse.session,
      status: backendResponse.session.status === 'open' ? 'active' : 
              backendResponse.session.status === 'aborted' ? 'cancelled' : 
              backendResponse.session.status,
    };

    // Map backend instances to frontend participants
    const mappedParticipants: Participant[] = backendResponse.instances.map((instance) => ({
      id: instance.id,
      session_id: instance.sessionId,
      identifier: instance.identifier,
      access_code: instance.accessCode,
      status: instance.startedAt ? (instance.completedAt ? 'completed' : 'in_progress') : 'not_started',
      started_at: instance.startedAt,
      completed_at: instance.completedAt,
      time_taken_minutes: instance.startedAt && instance.completedAt
        ? Math.round((new Date(instance.completedAt).getTime() - new Date(instance.startedAt).getTime()) / (1000 * 60))
        : undefined,
      total_score: instance.totalScore,
      max_score: undefined, // Not provided by backend
      createdAt: instance.createdAt,
    }));

    return {
      session: mappedSession,
      participants: mappedParticipants,
    };
  },

  async getReport(sessionId: string): Promise<TestSessionReport> {
    return apiRequest<TestSessionReport>(`/assessment/sessions/${sessionId}/report`);
  },

  async getParticipantDetails(sessionId: string, participantId: string): Promise<ParticipantDetail> {
    return apiRequest<ParticipantDetail>(`/assessment/sessions/${sessionId}/participants/${participantId}`);
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

// Helper function to convert template Date objects to ISO strings
const convertTemplateDates = (template: {
  id: string;
  name: string;
  description?: string;
  pools: Pool[];
  createdAt: Date | string;
  updatedAt: Date | string;
}): TestTemplate => {
  const createdAtStr = typeof template.createdAt === 'string' 
    ? template.createdAt 
    : (template.createdAt as Date).toISOString();
  const updatedAtStr = typeof template.updatedAt === 'string' 
    ? template.updatedAt 
    : (template.updatedAt as Date).toISOString();
  
  return {
    ...template,
    createdAt: createdAtStr,
    updatedAt: updatedAtStr,
  };
};

export const bankQuestionsApi = {
  async getAll(tags?: string[]): Promise<BankQuestion[]> {
    const params = tags && tags.length > 0 ? `?tags=${tags.join(',')}` : '';
    const questions = await apiRequest<Array<{
      id: string;
      text: string;
      answers: Array<{ id: string; text: string }>;
      correctAnswerId: string;
      tags: string[];
      createdAt: Date | string;
      updatedAt: Date | string;
    }>>(`/design/questions${params}`);
    return questions.map(convertQuestionDates);
  },

  async getById(id: string): Promise<BankQuestion> {
    const question = await apiRequest<{
      id: string;
      text: string;
      answers: Array<{ id: string; text: string }>;
      correctAnswerId: string;
      tags: string[];
      createdAt: Date | string;
      updatedAt: Date | string;
    }>(`/design/questions/${id}`);
    return convertQuestionDates(question);
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

  async delete(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/design/questions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Legacy alias for backward compatibility (can be removed after updating all usages)
export const questionBankApi = bankQuestionsApi;

