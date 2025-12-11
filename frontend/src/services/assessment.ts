import { apiRequest } from './core';

export type ParticipantQuestion = {
  id: string;
  text: string;
  answers: Array<{ id: string; text: string }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type ParticipantSection = {
  poolId: string;
  poolName: string;
  points: number;
  questions: ParticipantQuestion[];
};

export type ParticipantTestContent = {
  id: string;
  templateId: string;
  sections: ParticipantSection[];
  createdAt: string;
};

export type ParticipantTestInstance = {
  id: string;
  sessionId: string;
  identifier: string;
  accessCode: string;
  testContent: ParticipantTestContent;
  startedAt?: string;
  completedAt?: string;
  totalScore?: number;
  createdAt: string;
};

export const assessmentService = {
  startTestInstance: (accessCode: string) => 
    apiRequest<ParticipantTestInstance>('/assessment/start', {
      method: 'POST',
      body: JSON.stringify({ accessCode }),
      skipAuth: true
    })
};
