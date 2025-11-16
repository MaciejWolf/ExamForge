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

