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
  ];

  mockPools.push(...samplePools);
  initializedUsers.add(examinerId);

  // Initialize sample questions for the first pool
  const mathPoolId = samplePools[0].id;
  const sampleQuestions: Question[] = [
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
  ];

  mockQuestions.push(...sampleQuestions);
  // Update question count for the math pool
  samplePools[0].questionCount = sampleQuestions.length;
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

