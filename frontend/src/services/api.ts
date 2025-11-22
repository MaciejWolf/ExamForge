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

export type Tag = {
  id: string;
  name: string;
};

export interface BankQuestion {
  id: string;
  text: string;
  answers: Array<{
    id: string;
    text: string;
  }>;
  correctAnswerId: string;
  tags: Tag[];
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
  tags?: Tag[];
}

export interface UpdateBankQuestionRequest {
  text?: string;
  answers?: Array<{
    id: string;
    text: string;
  }>;
  correctAnswerId?: string;
  tags?: Tag[];
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

// Mock data for Question Bank (to be replaced with real API calls)
const MOCK_QUESTION_BANK_DATA: BankQuestion[] = [
  {
    id: '1',
    text: 'What is 2+2?',
    answers: [
      { id: 'a1', text: '3' },
      { id: 'a2', text: '4' },
      { id: 'a3', text: '5' },
      { id: 'a4', text: '6' },
    ],
    correctAnswerId: 'a2',
    tags: [
      { id: 'tag1', name: 'Mathematics' },
      { id: 'tag2', name: 'Basic' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    text: 'Solve: 3x = 15',
    answers: [
      { id: 'b1', text: 'x = 3' },
      { id: 'b2', text: 'x = 5' },
      { id: 'b3', text: 'x = 10' },
      { id: 'b4', text: 'x = 15' },
    ],
    correctAnswerId: 'b2',
    tags: [
      { id: 'tag1', name: 'Mathematics' },
      { id: 'tag3', name: 'Advanced' },
    ],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    text: "Newton's First Law states that an object at rest will remain at rest unless acted upon by an external force.",
    answers: [
      { id: 'c1', text: 'True' },
      { id: 'c2', text: 'False' },
    ],
    correctAnswerId: 'c1',
    tags: [
      { id: 'tag4', name: 'Physics' },
      { id: 'tag3', name: 'Advanced' },
    ],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    text: 'What is the chemical symbol for water?',
    answers: [
      { id: 'd1', text: 'H2O' },
      { id: 'd2', text: 'CO2' },
      { id: 'd3', text: 'NaCl' },
      { id: 'd4', text: 'O2' },
    ],
    correctAnswerId: 'd1',
    tags: [
      { id: 'tag5', name: 'Chemistry' },
      { id: 'tag2', name: 'Basic' },
    ],
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
  {
    id: '5',
    text: 'Who wrote "Romeo and Juliet"?',
    answers: [
      { id: 'e1', text: 'Charles Dickens' },
      { id: 'e2', text: 'William Shakespeare' },
      { id: 'e3', text: 'Jane Austen' },
      { id: 'e4', text: 'Mark Twain' },
    ],
    correctAnswerId: 'e2',
    tags: [
      { id: 'tag6', name: 'History' },
      { id: 'tag2', name: 'Basic' },
    ],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const questionBankApi = {
  async getAll(): Promise<BankQuestion[]> {
    // Simulate network delay
    await delay(300);
    // TODO: Replace with real API call when backend is ready
    // return apiRequest<BankQuestion[]>('/design/questions');
    return Promise.resolve([...MOCK_QUESTION_BANK_DATA]);
  },

  async create(data: CreateBankQuestionRequest): Promise<BankQuestion> {
    // Simulate network delay
    await delay(300);
    // TODO: Replace with real API call when backend is ready
    // return apiRequest<BankQuestion>('/design/questions', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });
    const newQuestion: BankQuestion = {
      id: `mock-${Date.now()}`,
      text: data.text,
      answers: data.answers,
      correctAnswerId: data.correctAnswerId,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_QUESTION_BANK_DATA.push(newQuestion);
    return Promise.resolve(newQuestion);
  },

  async update(id: string, data: UpdateBankQuestionRequest): Promise<BankQuestion> {
    // Simulate network delay
    await delay(300);
    // TODO: Replace with real API call when backend is ready
    // return apiRequest<BankQuestion>(`/design/questions/${id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(data),
    // });
    const index = MOCK_QUESTION_BANK_DATA.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Question not found');
    }
    const updatedQuestion: BankQuestion = {
      ...MOCK_QUESTION_BANK_DATA[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    MOCK_QUESTION_BANK_DATA[index] = updatedQuestion;
    return Promise.resolve(updatedQuestion);
  },

  async delete(id: string): Promise<void> {
    // Simulate network delay
    await delay(300);
    // TODO: Replace with real API call when backend is ready
    // return apiRequest<void>(`/design/questions/${id}`, {
    //   method: 'DELETE',
    // });
    const index = MOCK_QUESTION_BANK_DATA.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Question not found');
    }
    MOCK_QUESTION_BANK_DATA.splice(index, 1);
    return Promise.resolve();
  },
};

