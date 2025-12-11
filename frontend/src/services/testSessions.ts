import { apiRequest } from './core';
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  TestSessionDetail,
  TestSession,
  Participant,
  TestSessionReport,
  ParticipantDetail,
} from './types';

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
