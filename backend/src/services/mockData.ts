export interface QuestionPool {
  id: string;
  name: string;
  examiner_id: string;
  questionCount: number;
  createdAt: string;
}

// In-memory mock data storage
let mockPools: QuestionPool[] = [];
const initializedUsers = new Set<string>();
let nextId = 1;

// Initialize sample pools for a user if they don't have any
const initializeSamplePools = (examinerId: string) => {
  if (initializedUsers.has(examinerId)) {
    return;
  }

  const samplePools: QuestionPool[] = [
    {
      id: String(nextId++),
      name: 'Mathematics Basic',
      examiner_id: examinerId,
      questionCount: 15,
      createdAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: String(nextId++),
      name: 'Physics Advanced',
      examiner_id: examinerId,
      questionCount: 23,
      createdAt: new Date('2024-01-20').toISOString(),
    },
    {
      id: String(nextId++),
      name: 'Chemistry Foundations',
      examiner_id: examinerId,
      questionCount: 8,
      createdAt: new Date('2024-02-01').toISOString(),
    },
  ];

  mockPools.push(...samplePools);
  initializedUsers.add(examinerId);
};

export const getPoolsByExaminer = (examinerId: string): QuestionPool[] => {
  // Initialize sample pools for new users
  if (!initializedUsers.has(examinerId)) {
    initializeSamplePools(examinerId);
  }
  return mockPools.filter((pool) => pool.examiner_id === examinerId);
};

export const getPoolById = (poolId: string, examinerId: string): QuestionPool | undefined => {
  return mockPools.find((pool) => pool.id === poolId && pool.examiner_id === examinerId);
};

export const createPool = (name: string, examinerId: string): QuestionPool => {
  const newPool: QuestionPool = {
    id: String(nextId++),
    name,
    examiner_id: examinerId,
    questionCount: 0,
    createdAt: new Date().toISOString(),
  };
  mockPools.push(newPool);
  return newPool;
};

export const updatePool = (poolId: string, name: string, examinerId: string): QuestionPool | null => {
  const pool = getPoolById(poolId, examinerId);
  if (!pool) return null;
  
  pool.name = name;
  return pool;
};

export const deletePool = (poolId: string, examinerId: string): boolean => {
  const index = mockPools.findIndex((pool) => pool.id === poolId && pool.examiner_id === examinerId);
  if (index === -1) return false;
  
  mockPools.splice(index, 1);
  return true;
};

