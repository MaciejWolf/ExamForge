import { SupabaseClient } from '@supabase/supabase-js';
import { TestSession } from './types/testSession';
import { TestInstance } from './types/testInstance';

export type Document<T> = {
  id: string;
  data: T;
  owner_id?: string;
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
  findByAccessCode(accessCode: string): Promise<TestInstance | null>;
  findById(id: string): Promise<TestInstance | null>;
  getParticipantCounts(sessionIds: string[]): Promise<Map<string, number>>;
}

const mapDocumentToSession = (doc: Document<TestSession>): TestSession => {
  const session = doc.data as any;
  return {
    ...session,
    startTime: new Date(session.startTime),
    endTime: new Date(session.endTime),
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt),
  };
};

const mapDocumentToInstance = (doc: Document<TestInstance>): TestInstance => {
  const instance = doc.data as any;
  return {
    ...instance,
    createdAt: new Date(instance.createdAt),
    startedAt: instance.startedAt ? new Date(instance.startedAt) : undefined,
    completedAt: instance.completedAt ? new Date(instance.completedAt) : undefined,
    testContent: {
      ...instance.testContent,
      createdAt: new Date(instance.testContent.createdAt)
    }
  };
};

export const createSupabaseSessionRepository = (
  supabase: SupabaseClient,
  explicitOwnerId?: string
): SessionRepository => {
  const mapSessionToDocument = (session: TestSession): Document<TestSession> => {
    const doc: Document<TestSession> = {
      id: session.id,
      data: session,
    };

    // CRITICAL: Only set if explicitly provided.
    // If undefined, we omit the key so Postgres keeps existing value (on update) or uses default (on insert).
    if (explicitOwnerId) {
      doc.owner_id = explicitOwnerId;
    }

    return doc;
  };

  return {
    save: async (session: TestSession) => {
      const doc = mapSessionToDocument(session);
      const { error } = await supabase
        .from('test_sessions')
        .upsert(doc);

      if (error) {
        console.error('FULL DB ERROR:', JSON.stringify(error, null, 2)); // improved logging
        // Include the original error message in the new error
        throw new Error(`Could not save session: ${error.message} (Code: ${error.code})`);
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

export const createSupabaseTestInstanceRepository = (
  supabase: SupabaseClient,
  explicitOwnerId?: string
): TestInstanceRepository => {
  console.log('createSupabaseTestInstanceRepository initialized with ownerId:', explicitOwnerId);

  const mapInstanceToDocument = (instance: TestInstance): Document<TestInstance> => {
    const doc: Document<TestInstance> = {
      id: instance.id,
      data: instance,
    };

    // CRITICAL: Only set if explicitly provided.
    // If undefined, we omit the key so Postgres keeps existing value (on update) or uses default (on insert).
    if (explicitOwnerId) {
      doc.owner_id = explicitOwnerId;
    }

    return doc;
  };

  return {
    save: async (instance: TestInstance) => {
      const doc = mapInstanceToDocument(instance);
      const { error } = await supabase
        .from('test_instances')
        .insert(doc);

      if (error) {
        console.error('FULL DB ERROR:', JSON.stringify(error, null, 2));
        throw new Error(`Could not save test instance: ${error.message} (Code: ${error.code})`);
      }
    },
    saveMany: async (instances: TestInstance[]) => {
      const docs = instances.map(mapInstanceToDocument);
      console.log('Saving instances with docs:', JSON.stringify(docs, null, 2));

      const { error } = await supabase
        .from('test_instances')
        .insert(docs);

      if (error) {
        console.error('FULL DB ERROR:', JSON.stringify(error, null, 2));
        throw new Error(`Could not save test instances: ${error.message} (Code: ${error.code})`);
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
    findByAccessCode: async (accessCode: string) => {
      const { data, error } = await supabase
        .from('test_instances')
        .select('*')
        .eq('data->>accessCode', accessCode)
        .maybeSingle();

      if (error) {
        console.error('Error finding instance by access code:', error);
        throw new Error('Could not find instance');
      }

      return data ? mapDocumentToInstance(data as Document<TestInstance>) : null;
    },
    findById: async (id: string) => {
      const { data, error } = await supabase
        .from('test_instances')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error finding instance by id:', error);
        throw new Error('Could not find instance');
      }

      return data ? mapDocumentToInstance(data as Document<TestInstance>) : null;
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
    findByAccessCode: async (accessCode: string) => {
      return Array.from(instances.values()).find(i => i.accessCode === accessCode) || null;
    },
    findById: async (id: string) => {
      return instances.get(id) || null;
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
