import { TestSession } from './types/testSession';

export interface SessionRepository {
  save(session: TestSession): Promise<void>;
  findById(id: string): Promise<TestSession | null>;
  listAll(): Promise<TestSession[]>;
}

export const createInMemorySessionRepository = (): SessionRepository => {
  const sessions = new Map<string, TestSession>();

  return {
    save: async (session: TestSession) => {
      sessions.set(session.id, session);
    },
    findById: async (id: string) => {
      return sessions.get(id) || null;
    },
    listAll: async () => {
      return Array.from(sessions.values());
    }
  };
};
