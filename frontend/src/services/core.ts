import { supabase } from '@/lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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

export async function apiRequest<T>(
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
