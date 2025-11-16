export interface QuestionPool {
  id: string;
  name: string;
  examiner_id: string;
  questionCount: number;
  createdAt: string;
}

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  pool_id: string;
  content: string;
  points: number;
  answers: Answer[];
  createdAt: string;
}

export interface TestTemplate {
  id: string;
  name: string;
  examiner_id: string;
  poolSelections: Array<{ poolId: string; questionsToDraw: number }>;
  createdAt: string;
}

// In-memory mock data storage
let mockPools: QuestionPool[] = [];
let mockQuestions: Question[] = [];
let mockTemplates: TestTemplate[] = [];
const initializedUsers = new Set<string>();
let nextId = 1;
let nextQuestionId = 1;
let nextAnswerId = 1;
let nextTemplateId = 1;

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
      questionCount: 0,
      createdAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: String(nextId++),
      name: 'Physics Advanced',
      examiner_id: examinerId,
      questionCount: 0,
      createdAt: new Date('2024-01-20').toISOString(),
    },
    {
      id: String(nextId++),
      name: 'Chemistry Foundations',
      examiner_id: examinerId,
      questionCount: 0,
      createdAt: new Date('2024-02-01').toISOString(),
    },
    {
      id: String(nextId++),
      name: 'Computer Science Fundamentals',
      examiner_id: examinerId,
      questionCount: 0,
      createdAt: new Date('2024-02-10').toISOString(),
    },
    {
      id: String(nextId++),
      name: 'History World War II',
      examiner_id: examinerId,
      questionCount: 0,
      createdAt: new Date('2024-02-15').toISOString(),
    },
    {
      id: String(nextId++),
      name: 'Biology Cell Structure',
      examiner_id: examinerId,
      questionCount: 0,
      createdAt: new Date('2024-02-20').toISOString(),
    },
  ];

  mockPools.push(...samplePools);
  initializedUsers.add(examinerId);

  // Initialize sample questions for all pools
  const mathPoolId = samplePools[0].id;
  const physicsPoolId = samplePools[1].id;
  const chemistryPoolId = samplePools[2].id;
  const csPoolId = samplePools[3].id;
  const historyPoolId = samplePools[4].id;
  const biologyPoolId = samplePools[5].id;

  const sampleQuestions: Question[] = [
    // Mathematics Basic questions
    {
      id: String(nextQuestionId++),
      pool_id: mathPoolId,
      content: 'What is 2+2?',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: '3', isCorrect: false },
        { id: String(nextAnswerId++), text: '4', isCorrect: true },
        { id: String(nextAnswerId++), text: '5', isCorrect: false },
        { id: String(nextAnswerId++), text: '6', isCorrect: false },
      ],
      createdAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: mathPoolId,
      content: 'Solve: 3x = 15',
      points: 3,
      answers: [
        { id: String(nextAnswerId++), text: '3', isCorrect: false },
        { id: String(nextAnswerId++), text: '5', isCorrect: true },
        { id: String(nextAnswerId++), text: '12', isCorrect: false },
      ],
      createdAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: mathPoolId,
      content: 'What is the value of π (pi)?',
      points: 4,
      answers: [
        { id: String(nextAnswerId++), text: '3.14', isCorrect: true },
        { id: String(nextAnswerId++), text: '2.71', isCorrect: false },
        { id: String(nextAnswerId++), text: '1.41', isCorrect: false },
        { id: String(nextAnswerId++), text: '4.13', isCorrect: false },
      ],
      createdAt: new Date('2024-01-16').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: mathPoolId,
      content: 'What is the square root of 64?',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: '6', isCorrect: false },
        { id: String(nextAnswerId++), text: '7', isCorrect: false },
        { id: String(nextAnswerId++), text: '8', isCorrect: true },
        { id: String(nextAnswerId++), text: '9', isCorrect: false },
      ],
      createdAt: new Date('2024-01-17').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: mathPoolId,
      content: 'Calculate: 15 × 4',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: '50', isCorrect: false },
        { id: String(nextAnswerId++), text: '60', isCorrect: true },
        { id: String(nextAnswerId++), text: '70', isCorrect: false },
        { id: String(nextAnswerId++), text: '80', isCorrect: false },
      ],
      createdAt: new Date('2024-01-18').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: mathPoolId,
      content: 'What is the area of a circle with radius 5? (Use π = 3.14)',
      points: 5,
      answers: [
        { id: String(nextAnswerId++), text: '31.4', isCorrect: false },
        { id: String(nextAnswerId++), text: '78.5', isCorrect: true },
        { id: String(nextAnswerId++), text: '15.7', isCorrect: false },
        { id: String(nextAnswerId++), text: '25', isCorrect: false },
      ],
      createdAt: new Date('2024-01-19').toISOString(),
    },
    // Physics Advanced questions
    {
      id: String(nextQuestionId++),
      pool_id: physicsPoolId,
      content: 'What is the speed of light in vacuum?',
      points: 3,
      answers: [
        { id: String(nextAnswerId++), text: '3 × 10^8 m/s', isCorrect: true },
        { id: String(nextAnswerId++), text: '3 × 10^6 m/s', isCorrect: false },
        { id: String(nextAnswerId++), text: '3 × 10^10 m/s', isCorrect: false },
        { id: String(nextAnswerId++), text: '3 × 10^5 m/s', isCorrect: false },
      ],
      createdAt: new Date('2024-01-20').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: physicsPoolId,
      content: 'What is Newton\'s second law of motion?',
      points: 4,
      answers: [
        { id: String(nextAnswerId++), text: 'F = ma', isCorrect: true },
        { id: String(nextAnswerId++), text: 'E = mc²', isCorrect: false },
        { id: String(nextAnswerId++), text: 'PV = nRT', isCorrect: false },
        { id: String(nextAnswerId++), text: 'V = IR', isCorrect: false },
      ],
      createdAt: new Date('2024-01-21').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: physicsPoolId,
      content: 'What is the unit of electric current?',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: 'Volt', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Ampere', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Ohm', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Watt', isCorrect: false },
      ],
      createdAt: new Date('2024-01-22').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: physicsPoolId,
      content: 'What is the formula for kinetic energy?',
      points: 3,
      answers: [
        { id: String(nextAnswerId++), text: 'KE = ½mv²', isCorrect: true },
        { id: String(nextAnswerId++), text: 'KE = mgh', isCorrect: false },
        { id: String(nextAnswerId++), text: 'KE = mv', isCorrect: false },
        { id: String(nextAnswerId++), text: 'KE = ½mv', isCorrect: false },
      ],
      createdAt: new Date('2024-01-23').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: physicsPoolId,
      content: 'What is the acceleration due to gravity on Earth?',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: '9.8 m/s²', isCorrect: true },
        { id: String(nextAnswerId++), text: '10 m/s²', isCorrect: false },
        { id: String(nextAnswerId++), text: '8.9 m/s²', isCorrect: false },
        { id: String(nextAnswerId++), text: '11 m/s²', isCorrect: false },
      ],
      createdAt: new Date('2024-01-24').toISOString(),
    },
    // Chemistry Foundations questions
    {
      id: String(nextQuestionId++),
      pool_id: chemistryPoolId,
      content: 'What is the chemical symbol for water?',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: 'H2O', isCorrect: true },
        { id: String(nextAnswerId++), text: 'CO2', isCorrect: false },
        { id: String(nextAnswerId++), text: 'NaCl', isCorrect: false },
        { id: String(nextAnswerId++), text: 'O2', isCorrect: false },
      ],
      createdAt: new Date('2024-02-01').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: chemistryPoolId,
      content: 'What is the atomic number of carbon?',
      points: 3,
      answers: [
        { id: String(nextAnswerId++), text: '6', isCorrect: true },
        { id: String(nextAnswerId++), text: '12', isCorrect: false },
        { id: String(nextAnswerId++), text: '14', isCorrect: false },
        { id: String(nextAnswerId++), text: '8', isCorrect: false },
      ],
      createdAt: new Date('2024-02-02').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: chemistryPoolId,
      content: 'What is the pH of a neutral solution?',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: '5', isCorrect: false },
        { id: String(nextAnswerId++), text: '7', isCorrect: true },
        { id: String(nextAnswerId++), text: '9', isCorrect: false },
        { id: String(nextAnswerId++), text: '14', isCorrect: false },
      ],
      createdAt: new Date('2024-02-03').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: chemistryPoolId,
      content: 'What is the most abundant gas in Earth\'s atmosphere?',
      points: 3,
      answers: [
        { id: String(nextAnswerId++), text: 'Oxygen', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Nitrogen', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Carbon dioxide', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Argon', isCorrect: false },
      ],
      createdAt: new Date('2024-02-04').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: chemistryPoolId,
      content: 'What type of bond is formed when electrons are shared between atoms?',
      points: 4,
      answers: [
        { id: String(nextAnswerId++), text: 'Ionic bond', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Covalent bond', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Hydrogen bond', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Metallic bond', isCorrect: false },
      ],
      createdAt: new Date('2024-02-05').toISOString(),
    },
    // Computer Science Fundamentals questions
    {
      id: String(nextQuestionId++),
      pool_id: csPoolId,
      content: 'What does HTML stand for?',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: 'HyperText Markup Language', isCorrect: true },
        { id: String(nextAnswerId++), text: 'High-Level Text Markup Language', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Hyperlink and Text Markup Language', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Home Tool Markup Language', isCorrect: false },
      ],
      createdAt: new Date('2024-02-10').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: csPoolId,
      content: 'What is the time complexity of binary search?',
      points: 4,
      answers: [
        { id: String(nextAnswerId++), text: 'O(n)', isCorrect: false },
        { id: String(nextAnswerId++), text: 'O(log n)', isCorrect: true },
        { id: String(nextAnswerId++), text: 'O(n²)', isCorrect: false },
        { id: String(nextAnswerId++), text: 'O(1)', isCorrect: false },
      ],
      createdAt: new Date('2024-02-11').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: csPoolId,
      content: 'What is a variable that stores a memory address called?',
      points: 3,
      answers: [
        { id: String(nextAnswerId++), text: 'Array', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Pointer', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Reference', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Index', isCorrect: false },
      ],
      createdAt: new Date('2024-02-12').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: csPoolId,
      content: 'What does API stand for?',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: 'Application Programming Interface', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Automated Program Integration', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Advanced Programming Interface', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Application Process Integration', isCorrect: false },
      ],
      createdAt: new Date('2024-02-13').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: csPoolId,
      content: 'Which data structure follows LIFO (Last In First Out) principle?',
      points: 3,
      answers: [
        { id: String(nextAnswerId++), text: 'Queue', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Stack', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Array', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Linked List', isCorrect: false },
      ],
      createdAt: new Date('2024-02-14').toISOString(),
    },
    // History World War II questions
    {
      id: String(nextQuestionId++),
      pool_id: historyPoolId,
      content: 'In which year did World War II end?',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: '1944', isCorrect: false },
        { id: String(nextAnswerId++), text: '1945', isCorrect: true },
        { id: String(nextAnswerId++), text: '1946', isCorrect: false },
        { id: String(nextAnswerId++), text: '1947', isCorrect: false },
      ],
      createdAt: new Date('2024-02-15').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: historyPoolId,
      content: 'Which event is considered the start of World War II in Europe?',
      points: 4,
      answers: [
        { id: String(nextAnswerId++), text: 'Invasion of Poland', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Attack on Pearl Harbor', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Battle of Britain', isCorrect: false },
        { id: String(nextAnswerId++), text: 'D-Day', isCorrect: false },
      ],
      createdAt: new Date('2024-02-16').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: historyPoolId,
      content: 'Who was the leader of Nazi Germany during World War II?',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: 'Benito Mussolini', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Adolf Hitler', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Joseph Stalin', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Winston Churchill', isCorrect: false },
      ],
      createdAt: new Date('2024-02-17').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: historyPoolId,
      content: 'Which battle is considered the turning point of World War II in the Pacific?',
      points: 4,
      answers: [
        { id: String(nextAnswerId++), text: 'Battle of Midway', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Battle of Guadalcanal', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Battle of Iwo Jima', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Battle of Okinawa', isCorrect: false },
      ],
      createdAt: new Date('2024-02-18').toISOString(),
    },
    // Biology Cell Structure questions
    {
      id: String(nextQuestionId++),
      pool_id: biologyPoolId,
      content: 'What is the powerhouse of the cell?',
      points: 2,
      answers: [
        { id: String(nextAnswerId++), text: 'Nucleus', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Mitochondria', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Ribosome', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Golgi apparatus', isCorrect: false },
      ],
      createdAt: new Date('2024-02-20').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: biologyPoolId,
      content: 'Which organelle contains the cell\'s genetic material?',
      points: 3,
      answers: [
        { id: String(nextAnswerId++), text: 'Mitochondria', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Nucleus', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Endoplasmic reticulum', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Lysosome', isCorrect: false },
      ],
      createdAt: new Date('2024-02-21').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: biologyPoolId,
      content: 'What is the function of ribosomes?',
      points: 3,
      answers: [
        { id: String(nextAnswerId++), text: 'Energy production', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Protein synthesis', isCorrect: true },
        { id: String(nextAnswerId++), text: 'DNA replication', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Waste removal', isCorrect: false },
      ],
      createdAt: new Date('2024-02-22').toISOString(),
    },
    {
      id: String(nextQuestionId++),
      pool_id: biologyPoolId,
      content: 'Which type of cell lacks a nucleus?',
      points: 3,
      answers: [
        { id: String(nextAnswerId++), text: 'Eukaryotic cell', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Prokaryotic cell', isCorrect: true },
        { id: String(nextAnswerId++), text: 'Plant cell', isCorrect: false },
        { id: String(nextAnswerId++), text: 'Animal cell', isCorrect: false },
      ],
      createdAt: new Date('2024-02-23').toISOString(),
    },
  ];

  mockQuestions.push(...sampleQuestions);
  
  // Update question counts for all pools
  samplePools[0].questionCount = sampleQuestions.filter(q => q.pool_id === mathPoolId).length;
  samplePools[1].questionCount = sampleQuestions.filter(q => q.pool_id === physicsPoolId).length;
  samplePools[2].questionCount = sampleQuestions.filter(q => q.pool_id === chemistryPoolId).length;
  samplePools[3].questionCount = sampleQuestions.filter(q => q.pool_id === csPoolId).length;
  samplePools[4].questionCount = sampleQuestions.filter(q => q.pool_id === historyPoolId).length;
  samplePools[5].questionCount = sampleQuestions.filter(q => q.pool_id === biologyPoolId).length;

  // Initialize sample test templates
  const sampleTemplates: TestTemplate[] = [
    {
      id: String(nextTemplateId++),
      name: 'Math & Physics Combined Test',
      examiner_id: examinerId,
      poolSelections: [
        { poolId: mathPoolId, questionsToDraw: 3 },
        { poolId: physicsPoolId, questionsToDraw: 2 },
      ],
      createdAt: new Date('2024-02-25').toISOString(),
    },
    {
      id: String(nextTemplateId++),
      name: 'Science Comprehensive Exam',
      examiner_id: examinerId,
      poolSelections: [
        { poolId: physicsPoolId, questionsToDraw: 3 },
        { poolId: chemistryPoolId, questionsToDraw: 3 },
        { poolId: biologyPoolId, questionsToDraw: 2 },
      ],
      createdAt: new Date('2024-02-26').toISOString(),
    },
    {
      id: String(nextTemplateId++),
      name: 'Computer Science Basics',
      examiner_id: examinerId,
      poolSelections: [
        { poolId: csPoolId, questionsToDraw: 4 },
      ],
      createdAt: new Date('2024-02-27').toISOString(),
    },
    {
      id: String(nextTemplateId++),
      name: 'General Knowledge Test',
      examiner_id: examinerId,
      poolSelections: [
        { poolId: mathPoolId, questionsToDraw: 2 },
        { poolId: historyPoolId, questionsToDraw: 2 },
        { poolId: csPoolId, questionsToDraw: 2 },
      ],
      createdAt: new Date('2024-02-28').toISOString(),
    },
  ];

  mockTemplates.push(...sampleTemplates);
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
  
  // Delete all questions in this pool
  mockQuestions = mockQuestions.filter((q) => q.pool_id !== poolId);
  
  mockPools.splice(index, 1);
  return true;
};

// Helper function to update question count for a pool
const updatePoolQuestionCount = (poolId: string) => {
  const pool = mockPools.find((p) => p.id === poolId);
  if (pool) {
    pool.questionCount = mockQuestions.filter((q) => q.pool_id === poolId).length;
  }
};

// Question CRUD operations
export const getQuestionsByPool = (poolId: string, examinerId: string): Question[] => {
  // Verify pool belongs to examiner
  const pool = getPoolById(poolId, examinerId);
  if (!pool) return [];
  
  return mockQuestions.filter((q) => q.pool_id === poolId);
};

export const getQuestionById = (questionId: string, poolId: string, examinerId: string): Question | undefined => {
  // Verify pool belongs to examiner
  const pool = getPoolById(poolId, examinerId);
  if (!pool) return undefined;
  
  return mockQuestions.find((q) => q.id === questionId && q.pool_id === poolId);
};

export const createQuestion = (
  poolId: string,
  content: string,
  points: number,
  answers: Omit<Answer, 'id'>[],
  examinerId: string
): Question | null => {
  // Verify pool belongs to examiner
  const pool = getPoolById(poolId, examinerId);
  if (!pool) return null;

  // Validate answers
  if (answers.length < 2 || answers.length > 6) {
    throw new Error('Question must have between 2 and 6 answers');
  }

  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  if (correctAnswers !== 1) {
    throw new Error('Question must have exactly one correct answer');
  }

  // Validate all answer texts are non-empty
  if (answers.some((a) => !a.text || !a.text.trim())) {
    throw new Error('All answers must have non-empty text');
  }

  const newQuestion: Question = {
    id: String(nextQuestionId++),
    pool_id: poolId,
    content: content.trim(),
    points,
    answers: answers.map((a) => ({
      id: String(nextAnswerId++),
      text: a.text.trim(),
      isCorrect: a.isCorrect,
    })),
    createdAt: new Date().toISOString(),
  };

  mockQuestions.push(newQuestion);
  updatePoolQuestionCount(poolId);
  
  return newQuestion;
};

export const updateQuestion = (
  questionId: string,
  poolId: string,
  content: string,
  points: number,
  answers: Omit<Answer, 'id'>[],
  examinerId: string
): Question | null => {
  // Verify pool belongs to examiner
  const pool = getPoolById(poolId, examinerId);
  if (!pool) return null;

  const question = getQuestionById(questionId, poolId, examinerId);
  if (!question) return null;

  // Validate answers
  if (answers.length < 2 || answers.length > 6) {
    throw new Error('Question must have between 2 and 6 answers');
  }

  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  if (correctAnswers !== 1) {
    throw new Error('Question must have exactly one correct answer');
  }

  // Validate all answer texts are non-empty
  if (answers.some((a) => !a.text || !a.text.trim())) {
    throw new Error('All answers must have non-empty text');
  }

  // Update question
  question.content = content.trim();
  question.points = points;
  question.answers = answers.map((a) => ({
    id: String(nextAnswerId++),
    text: a.text.trim(),
    isCorrect: a.isCorrect,
  }));

  return question;
};

export const deleteQuestion = (questionId: string, poolId: string, examinerId: string): boolean => {
  // Verify pool belongs to examiner
  const pool = getPoolById(poolId, examinerId);
  if (!pool) return false;

  const index = mockQuestions.findIndex((q) => q.id === questionId && q.pool_id === poolId);
  if (index === -1) return false;

  mockQuestions.splice(index, 1);
  updatePoolQuestionCount(poolId);
  
  return true;
};

// Test Template CRUD operations
export const getTemplatesByExaminer = (examinerId: string): TestTemplate[] => {
  return mockTemplates.filter((template) => template.examiner_id === examinerId);
};

export const getTemplateById = (templateId: string, examinerId: string): TestTemplate | undefined => {
  return mockTemplates.find(
    (template) => template.id === templateId && template.examiner_id === examinerId
  );
};

export const createTemplate = (
  name: string,
  poolSelections: Array<{ poolId: string; questionsToDraw: number }>,
  examinerId: string
): TestTemplate => {
  // Validate name uniqueness within examiner's templates
  const existingTemplates = getTemplatesByExaminer(examinerId);
  if (existingTemplates.some((t) => t.name.toLowerCase() === name.trim().toLowerCase())) {
    throw new Error('Template name must be unique');
  }

  // Validate at least one pool selection
  if (!poolSelections || poolSelections.length === 0) {
    throw new Error('At least one question pool must be selected');
  }

  // Validate each pool selection
  for (const selection of poolSelections) {
    // Validate questionsToDraw is positive integer
    if (!Number.isInteger(selection.questionsToDraw) || selection.questionsToDraw <= 0) {
      throw new Error('Questions to draw must be a positive integer');
    }

    // Verify pool belongs to examiner
    const pool = getPoolById(selection.poolId, examinerId);
    if (!pool) {
      throw new Error(`Pool with id ${selection.poolId} not found or does not belong to examiner`);
    }

    // Validate questionsToDraw doesn't exceed available questions
    const availableQuestions = mockQuestions.filter((q) => q.pool_id === selection.poolId).length;
    if (selection.questionsToDraw > availableQuestions) {
      throw new Error(
        `Cannot draw ${selection.questionsToDraw} questions from pool "${pool.name}" (only ${availableQuestions} available)`
      );
    }
  }

  const newTemplate: TestTemplate = {
    id: String(nextTemplateId++),
    name: name.trim(),
    examiner_id: examinerId,
    poolSelections,
    createdAt: new Date().toISOString(),
  };

  mockTemplates.push(newTemplate);
  return newTemplate;
};

export const updateTemplate = (
  templateId: string,
  name: string,
  poolSelections: Array<{ poolId: string; questionsToDraw: number }>,
  examinerId: string
): TestTemplate | null => {
  const template = getTemplateById(templateId, examinerId);
  if (!template) return null;

  // Validate name uniqueness (excluding current template)
  const existingTemplates = getTemplatesByExaminer(examinerId);
  if (
    existingTemplates.some(
      (t) => t.id !== templateId && t.name.toLowerCase() === name.trim().toLowerCase()
    )
  ) {
    throw new Error('Template name must be unique');
  }

  // Validate at least one pool selection
  if (!poolSelections || poolSelections.length === 0) {
    throw new Error('At least one question pool must be selected');
  }

  // Validate each pool selection
  for (const selection of poolSelections) {
    // Validate questionsToDraw is positive integer
    if (!Number.isInteger(selection.questionsToDraw) || selection.questionsToDraw <= 0) {
      throw new Error('Questions to draw must be a positive integer');
    }

    // Verify pool belongs to examiner
    const pool = getPoolById(selection.poolId, examinerId);
    if (!pool) {
      throw new Error(`Pool with id ${selection.poolId} not found or does not belong to examiner`);
    }

    // Validate questionsToDraw doesn't exceed available questions
    const availableQuestions = mockQuestions.filter((q) => q.pool_id === selection.poolId).length;
    if (selection.questionsToDraw > availableQuestions) {
      throw new Error(
        `Cannot draw ${selection.questionsToDraw} questions from pool "${pool.name}" (only ${availableQuestions} available)`
      );
    }
  }

  // Update template
  template.name = name.trim();
  template.poolSelections = poolSelections;
  return template;
};

export const deleteTemplate = (templateId: string, examinerId: string): boolean => {
  const index = mockTemplates.findIndex(
    (template) => template.id === templateId && template.examiner_id === examinerId
  );
  if (index === -1) return false;

  mockTemplates.splice(index, 1);
  return true;
};

