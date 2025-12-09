import { TestSession } from './types/testSession';
import { TestInstance } from './types/testInstance';

export interface SessionRepository {
  save(session: TestSession): Promise<void>;
  findById(id: string): Promise<TestSession | null>;
  listAll(): Promise<TestSession[]>;
}

export interface TestInstanceRepository {
  save(instance: TestInstance): Promise<void>;
  saveMany(instances: TestInstance[]): Promise<void>;
  findBySessionId(sessionId: string): Promise<TestInstance[]>;
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

export const createInMemoryTestInstanceRepository = (): TestInstanceRepository => {
  const instances = new Map<string, TestInstance>();

  return {
    save: async (instance: TestInstance) => {
      instances.set(instance.id, instance);
    },
    saveMany: async (newInstances: TestInstance[]) => {
      newInstances.forEach(instance => instances.set(instance.id, instance));
    },
    findBySessionId: async (sessionId: string) => {
      return Array.from(instances.values()).filter(i => i.sessionId === sessionId);
    }
  };
};
