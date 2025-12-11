import { apiRequest } from './core';
import type { BankQuestion, CreateBankQuestionRequest, UpdateBankQuestionRequest } from './types';

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
