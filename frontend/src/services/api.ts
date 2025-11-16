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

export interface Question {
  id: string;
  pool_id: string;
  content: string;
  points: number;
  answers: Answer[];
  createdAt: string;
}

export interface CreateQuestionRequest {
  content: string;
  points: number;
  answers: Omit<Answer, 'id'>[];
}

export interface UpdateQuestionRequest {
  content: string;
  points: number;
  answers: Omit<Answer, 'id'>[];
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

