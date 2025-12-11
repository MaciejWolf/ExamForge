import { SupabaseClient } from '@supabase/supabase-js';
import { TestSession } from './types/testSession';
import { TestInstance } from './types/testInstance';

export type Document<T> = {
  id: string;
  data: T;
};

export interface SessionRepository {
  save(session: TestSession): Promise<void>;
  findById(id: string): Promise<TestSession | null>;
  listAll(): Promise<TestSession[]>;
}

export interface TestInstanceRepository {
  save(instance: TestInstance): Promise<void>;
  saveMany(instances: TestInstance[]): Promise<void>;
  findBySessionId(sessionId: string): Promise<TestInstance[]>;
  getParticipantCounts(sessionIds: string[]): Promise<Map<string, number>>;
}

const mapDocumentToSession = (doc: Document<TestSession>): TestSession => {
  return doc.data;
};

const mapSessionToDocument = (session: TestSession): Document<TestSession> => {
  return {
    id: session.id,
    data: session,
  };
};

const mapDocumentToInstance = (doc: Document<TestInstance>): TestInstance => {
  return doc.data;
};

const mapInstanceToDocument = (instance: TestInstance): Document<TestInstance> => {
  return {
    id: instance.id,
    data: instance,
  };
};

export const createSupabaseSessionRepository = (supabase: SupabaseClient): SessionRepository => {
  return {
    save: async (session: TestSession) => {
      const doc = mapSessionToDocument(session);
      const { error } = await supabase
        .from('test_sessions')
        .upsert(doc);

      if (error) {
        console.error('Error saving session:', error);
        throw new Error('Could not save session');
      }
    },
    findById: async (id: string) => {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error finding session:', error);
        throw new Error('Could not find session');
      }

      return mapDocumentToSession(data as Document<TestSession>);
    },
    listAll: async () => {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*');

      if (error) {
        console.error('Error listing sessions:', error);
        throw new Error('Could not list sessions');
      }

      return (data as Document<TestSession>[]).map(mapDocumentToSession);
    }
  };
};

export const createSupabaseTestInstanceRepository = (supabase: SupabaseClient): TestInstanceRepository => {
  return {
    save: async (instance: TestInstance) => {
      const doc = mapInstanceToDocument(instance);
      const { error } = await supabase
        .from('test_instances')
        .upsert(doc);

      if (error) {
        console.error('Error saving test instance:', error);
        throw new Error('Could not save test instance');
      }
    },
    saveMany: async (instances: TestInstance[]) => {
      const docs = instances.map(mapInstanceToDocument);
      const { error } = await supabase
        .from('test_instances')
        .upsert(docs);

      if (error) {
        console.error('Error saving multiple test instances:', error);
        throw new Error('Could not save test instances');
      }
    },
    findBySessionId: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('test_instances')
        .select('*')
        // We need to filter by the session ID inside the JSON data
        .eq('data->>sessionId', sessionId);

      if (error) {
        console.error('Error finding instances by session ID:', error);
        throw new Error('Could not find instances');
      }

      return (data as Document<TestInstance>[]).map(mapDocumentToInstance);
    },
    getParticipantCounts: async (sessionIds: string[]) => {
      // Note: This is a naive implementation using multiple queries.
      // In a production environment with high volume, this should be optimized
      // using a Postgres View or a raw SQL query with aggregation.
      const counts = new Map<string, number>();

      await Promise.all(sessionIds.map(async (sessionId) => {
        const { count, error } = await supabase
          .from('test_instances')
          .select('*', { count: 'exact', head: true })
          .eq('data->>sessionId', sessionId);

        if (error) {
          console.error(`Error counting instances for session ${sessionId}:`, error);
          counts.set(sessionId, 0);
        } else {
          counts.set(sessionId, count || 0);
        }
      }));

      return counts;
    }
  };
};

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
    },
    getParticipantCounts: async (sessionIds: string[]) => {
      const counts = new Map<string, number>();
      sessionIds.forEach(id => counts.set(id, 0));

      for (const instance of instances.values()) {
        if (counts.has(instance.sessionId)) {
          counts.set(instance.sessionId, (counts.get(instance.sessionId) || 0) + 1);
        }
      }

      return counts;
    }
  };
};
