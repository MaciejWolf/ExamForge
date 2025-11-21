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
  answers: Answer[];
  createdAt: string;
}

export interface TestTemplate {
  id: string;
  name: string;
  examiner_id: string;
  poolSelections: Array<{ poolId: string; questionsToDraw: number; points: number }>;
  createdAt: string;
}

export interface TestSession {
  id: string;
  template_id: string;
  examiner_id: string;
  time_limit_minutes: number;
  status: 'active' | 'completed' | 'cancelled' | 'in_progress' | 'expired';
  createdAt: string;
}

export interface Participant {
  id: string;
  session_id: string;
  identifier: string;
  access_code: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'timed_out';
  started_at?: string;
  completed_at?: string;
  time_taken_minutes?: number;
  total_score?: number;
  max_score?: number;
  createdAt: string;
}

export interface ParticipantAnswer {
  question_id: string;
  selected_answer_id: string | null;
  is_correct: boolean;
  points_earned: number;
  points_possible: number;
}

// In-memory mock data storage
let mockPools: QuestionPool[] = [];
let mockQuestions: Question[] = [];
let mockTemplates: TestTemplate[] = [];
let mockTestSessions: TestSession[] = [];
let mockParticipants: Participant[] = [];
const participantAnswers = new Map<string, ParticipantAnswer[]>(); // Map<participantId, ParticipantAnswer[]>
const participantQuestions = new Map<string, Question[]>(); // Map<participantId, Question[]> - stores selected questions for each participant
const initializedUsers = new Set<string>();
let nextId = 1;
let nextQuestionId = 1;
let nextAnswerId = 1;
let nextTemplateId = 1;
let nextSessionId = 1;
let nextParticipantId = 1;

// Access code generation - 9 characters, uppercase alphanumeric, no ambiguous chars
const generateAccessCode = (): string => {
  // Exclude ambiguous characters: 0, O, 1, I, l
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  let attempts = 0;
  const maxAttempts = 100;

  do {
    code = '';
    for (let i = 0; i < 9; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    attempts++;
  } while (mockParticipants.some((p) => p.access_code === code) && attempts < maxAttempts);

  // Check if we still have a duplicate after max attempts
  if (mockParticipants.some((p) => p.access_code === code)) {
    throw new Error('Failed to generate unique access code after multiple attempts');
  }

  return code;
};

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
        { poolId: mathPoolId, questionsToDraw: 3, points: 10 },
        { poolId: physicsPoolId, questionsToDraw: 2, points: 8 },
      ],
      createdAt: new Date('2024-02-25').toISOString(),
    },
    {
      id: String(nextTemplateId++),
      name: 'Science Comprehensive Exam',
      examiner_id: examinerId,
      poolSelections: [
        { poolId: physicsPoolId, questionsToDraw: 3, points: 12 },
        { poolId: chemistryPoolId, questionsToDraw: 3, points: 10 },
        { poolId: biologyPoolId, questionsToDraw: 2, points: 6 },
      ],
      createdAt: new Date('2024-02-26').toISOString(),
    },
    {
      id: String(nextTemplateId++),
      name: 'Computer Science Basics',
      examiner_id: examinerId,
      poolSelections: [
        { poolId: csPoolId, questionsToDraw: 4, points: 14 },
      ],
      createdAt: new Date('2024-02-27').toISOString(),
    },
    {
      id: String(nextTemplateId++),
      name: 'General Knowledge Test',
      examiner_id: examinerId,
      poolSelections: [
        { poolId: mathPoolId, questionsToDraw: 2, points: 6 },
        { poolId: historyPoolId, questionsToDraw: 2, points: 8 },
        { poolId: csPoolId, questionsToDraw: 2, points: 6 },
      ],
      createdAt: new Date('2024-02-28').toISOString(),
    },
  ];

  mockTemplates.push(...sampleTemplates);

  // Initialize sample test sessions
  const sampleSessions: TestSession[] = [
    {
      id: String(nextSessionId++),
      template_id: sampleTemplates[0].id, // Math & Physics Combined Test
      examiner_id: examinerId,
      time_limit_minutes: 60,
      status: 'completed',
      createdAt: new Date('2025-11-15').toISOString(),
    },
    {
      id: String(nextSessionId++),
      template_id: sampleTemplates[1].id, // Science Comprehensive Exam
      examiner_id: examinerId,
      time_limit_minutes: 45,
      status: 'active',
      createdAt: new Date('2025-11-14').toISOString(),
    },
    {
      id: String(nextSessionId++),
      template_id: sampleTemplates[2].id, // Computer Science Basics
      examiner_id: examinerId,
      time_limit_minutes: 90,
      status: 'completed',
      createdAt: new Date('2025-11-13').toISOString(),
    },
    {
      id: String(nextSessionId++),
      template_id: sampleTemplates[3].id, // General Knowledge Test
      examiner_id: examinerId,
      time_limit_minutes: 30,
      status: 'active',
      createdAt: new Date('2025-11-12').toISOString(),
    },
  ];

  mockTestSessions.push(...sampleSessions);

  // Initialize sample participants for the test sessions
  const sampleParticipants: Participant[] = [
    // Participants for first session (completed)
    ...Array.from({ length: 25 }, (_, i) => ({
      id: String(nextParticipantId++),
      session_id: sampleSessions[0].id,
      identifier: `Student ${i + 1}`,
      access_code: generateAccessCode(),
      status: 'completed' as const,
      score: Math.floor(Math.random() * 100),
      createdAt: new Date('2025-11-15').toISOString(),
    })),
    // Participants for second session (active)
    ...Array.from({ length: 15 }, (_, i) => ({
      id: String(nextParticipantId++),
      session_id: sampleSessions[1].id,
      identifier: `Participant ${i + 1}`,
      access_code: generateAccessCode(),
      status: (i < 10 ? 'completed' : 'not_started') as 'not_started' | 'completed',
      score: i < 10 ? Math.floor(Math.random() * 100) : undefined,
      createdAt: new Date('2025-11-14').toISOString(),
    })),
    // Participants for third session (completed)
    ...Array.from({ length: 30 }, (_, i) => ({
      id: String(nextParticipantId++),
      session_id: sampleSessions[2].id,
      identifier: `CS Student ${i + 1}`,
      access_code: generateAccessCode(),
      status: 'completed' as const,
      score: Math.floor(Math.random() * 100),
      createdAt: new Date('2025-11-13').toISOString(),
    })),
    // Participants for fourth session (active)
    ...Array.from({ length: 10 }, (_, i) => ({
      id: String(nextParticipantId++),
      session_id: sampleSessions[3].id,
      identifier: `GK Participant ${i + 1}`,
      access_code: generateAccessCode(),
      status: 'not_started' as const,
      createdAt: new Date('2025-11-12').toISOString(),
    })),
  ];

  mockParticipants.push(...sampleParticipants);
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
  poolSelections: Array<{ poolId: string; questionsToDraw: number; points: number }>,
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

    // Validate points is positive number
    if (typeof selection.points !== 'number' || selection.points <= 0) {
      throw new Error('Points must be a positive number');
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
  poolSelections: Array<{ poolId: string; questionsToDraw: number; points: number }>,
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

    // Validate points is positive number
    if (typeof selection.points !== 'number' || selection.points <= 0) {
      throw new Error('Points must be a positive number');
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

// Test Session CRUD operations
export const createTestSession = (
  templateId: string,
  timeLimitMinutes: number,
  participantIdentifiers: string[],
  examinerId: string
): { session: TestSession; participants: Participant[] } => {
  // Verify template exists and belongs to examiner
  const template = getTemplateById(templateId, examinerId);
  if (!template) {
    throw new Error('Template not found or does not belong to examiner');
  }

  // Validate time limit
  if (!Number.isInteger(timeLimitMinutes) || timeLimitMinutes < 1 || timeLimitMinutes > 480) {
    throw new Error('Time limit must be between 1 and 480 minutes');
  }

  // Validate participants
  const validIdentifiers = participantIdentifiers
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  if (validIdentifiers.length === 0) {
    throw new Error('At least one participant identifier is required');
  }

  // Create test session
  const session: TestSession = {
    id: String(nextSessionId++),
    template_id: templateId,
    examiner_id: examinerId,
    time_limit_minutes: timeLimitMinutes,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  mockTestSessions.push(session);

  // Create participants with unique access codes
  const participants: Participant[] = validIdentifiers.map((identifier) => {
    const participant: Participant = {
      id: String(nextParticipantId++),
      session_id: session.id,
      identifier,
      access_code: generateAccessCode(),
      status: 'not_started',
      createdAt: new Date().toISOString(),
    };
    mockParticipants.push(participant);
    return participant;
  });

  return { session, participants };
};

export const getTestSessionsByExaminer = (examinerId: string): TestSession[] => {
  return mockTestSessions.filter((session) => session.examiner_id === examinerId);
};

export const getTestSessionById = (sessionId: string, examinerId: string): TestSession | undefined => {
  return mockTestSessions.find(
    (session) => session.id === sessionId && session.examiner_id === examinerId
  );
};

export const getParticipantsBySession = (sessionId: string, examinerId: string): Participant[] => {
  // Verify session belongs to examiner
  const session = getTestSessionById(sessionId, examinerId);
  if (!session) {
    return [];
  }

  return mockParticipants.filter((participant) => participant.session_id === sessionId);
};

export interface TestSessionDetail {
  id: string;
  template_id: string;
  template_name: string;
  examiner_id: string;
  time_limit_minutes: number;
  status: 'active' | 'completed' | 'cancelled' | 'in_progress' | 'expired';
  createdAt: string;
  participant_count: number;
}

export const getTestSessionsDetailsByExaminer = (examinerId: string): TestSessionDetail[] => {
  const sessions = getTestSessionsByExaminer(examinerId);
  
  return sessions.map((session) => {
    const template = getTemplateById(session.template_id, examinerId);
    const participants = mockParticipants.filter((p) => p.session_id === session.id);
    
    return {
      id: session.id,
      template_id: session.template_id,
      template_name: template?.name || 'Unknown Template',
      examiner_id: session.examiner_id,
      time_limit_minutes: session.time_limit_minutes,
      status: session.status,
      createdAt: session.createdAt,
      participant_count: participants.length,
    };
  });
};

// Helper function to get questions for a participant based on their session's template
const getParticipantQuestions = (participantId: string, sessionId: string, examinerId: string): Question[] => {
  // Return cached questions if available
  if (participantQuestions.has(participantId)) {
    return participantQuestions.get(participantId)!;
  }

  const session = getTestSessionById(sessionId, examinerId);
  if (!session) return [];

  const template = getTemplateById(session.template_id, examinerId);
  if (!template) return [];

  const selectedQuestions: Question[] = [];
  
  // Use participant ID as seed for deterministic random selection per participant
  let seed = parseInt(participantId.replace(/\D/g, '')) || 0;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (const poolSelection of template.poolSelections) {
    const poolQuestions = mockQuestions.filter((q) => q.pool_id === poolSelection.poolId);
    // Deterministically shuffle questions from the pool
    const shuffled = [...poolQuestions].sort(() => seededRandom() - 0.5);
    const selected = shuffled.slice(0, poolSelection.questionsToDraw);
    selectedQuestions.push(...selected);
  }

  // Cache the selected questions for this participant
  participantQuestions.set(participantId, selectedQuestions);
  return selectedQuestions;
};

// Generate mock participant data for a session
export const generateMockParticipantData = (sessionId: string, examinerId: string): void => {
  const session = getTestSessionById(sessionId, examinerId);
  if (!session) return;

  const template = getTemplateById(session.template_id, examinerId);
  if (!template) return;

  // Calculate max score from template pool selections (same for all participants)
  const maxScore = template.poolSelections.reduce((sum, ps) => sum + ps.points, 0);

  const participants = getParticipantsBySession(sessionId, examinerId);

  // Update participants with mock data
  participants.forEach((participant, index) => {
    // Get unique questions for this participant
    const questions = getParticipantQuestions(participant.id, sessionId, examinerId);
    
    // Calculate points per question for each pool selection
    const questionPointsMap = new Map<string, number>();
    let questionIndex = 0;
    for (const poolSelection of template.poolSelections) {
      const pointsPerQuestion = Math.round(poolSelection.points / poolSelection.questionsToDraw);
      for (let i = 0; i < poolSelection.questionsToDraw; i++) {
        if (questionIndex < questions.length) {
          questionPointsMap.set(questions[questionIndex].id, pointsPerQuestion);
          questionIndex++;
        }
      }
    }

    const statusRoll = Math.random();
    let status: Participant['status'] = 'not_started';
    let startedAt: string | undefined;
    let completedAt: string | undefined;
    let timeTaken: number | undefined;
    let totalScore: number | undefined;

    if (statusRoll < 0.7) {
      // 70% completed
      status = 'completed';
      startedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
      const sessionStart = new Date(startedAt);
      timeTaken = Math.floor(Math.random() * session.time_limit_minutes * 0.8 + session.time_limit_minutes * 0.2);
      completedAt = new Date(sessionStart.getTime() + timeTaken * 60 * 1000).toISOString();
      totalScore = Math.floor(Math.random() * maxScore * 0.4 + maxScore * 0.6); // 60-100% range
    } else if (statusRoll < 0.85) {
      // 15% in progress
      status = 'in_progress';
      startedAt = new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString();
      const sessionStart = new Date(startedAt);
      timeTaken = Math.floor((Date.now() - sessionStart.getTime()) / (60 * 1000));
      totalScore = Math.floor(Math.random() * maxScore * 0.5); // Current score 0-50%
    } else {
      // 15% not started
      status = 'not_started';
    }

    participant.status = status;
    participant.started_at = startedAt;
    participant.completed_at = completedAt;
    participant.time_taken_minutes = timeTaken;
    participant.total_score = totalScore;
    participant.max_score = maxScore;

    // Generate answers for completed and in-progress participants
    if (status === 'completed' || status === 'in_progress') {
      const answers: ParticipantAnswer[] = questions.map((question, qIndex) => {
        const pointsPerQuestion = questionPointsMap.get(question.id) || 0;
        const isCorrect = status === 'completed' 
          ? (qIndex < questions.length * (totalScore! / maxScore) + Math.random() * 0.2 - 0.1)
          : Math.random() < 0.5; // Random for in-progress
        
        const correctAnswer = question.answers.find((a) => a.isCorrect);
        const selectedAnswer = isCorrect 
          ? correctAnswer 
          : question.answers[Math.floor(Math.random() * question.answers.length)];

        return {
          question_id: question.id,
          selected_answer_id: selectedAnswer?.id || null,
          is_correct: isCorrect,
          points_earned: isCorrect ? pointsPerQuestion : 0,
          points_possible: pointsPerQuestion,
        };
      });

      participantAnswers.set(participant.id, answers);
    }
  });
};

// Calculate session statistics
export interface SessionStatistics {
  average_score: number;
  highest_score: number;
  lowest_score: number;
  completion_rate: number;
  completed_count: number;
  in_progress_count: number;
  not_started_count: number;
  total_participants: number;
}

export const calculateSessionStatistics = (sessionId: string, examinerId: string): SessionStatistics => {
  const participants = getParticipantsBySession(sessionId, examinerId);
  const completed = participants.filter((p) => p.status === 'completed');
  
  const scores = completed.map((p) => p.total_score || 0);
  const average_score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const highest_score = scores.length > 0 ? Math.max(...scores) : 0;
  const lowest_score = scores.length > 0 ? Math.min(...scores) : 0;
  
  const completed_count = completed.length;
  const in_progress_count = participants.filter((p) => p.status === 'in_progress').length;
  const not_started_count = participants.filter((p) => p.status === 'not_started').length;
  const total_participants = participants.length;
  const completion_rate = total_participants > 0 ? (completed_count / total_participants) * 100 : 0;

  return {
    average_score: Math.round(average_score * 100) / 100,
    highest_score,
    lowest_score,
    completion_rate: Math.round(completion_rate * 100) / 100,
    completed_count,
    in_progress_count,
    not_started_count,
    total_participants,
  };
};

// Question analysis for report
export interface QuestionAnalysis {
  question_id: string;
  question_number: number;
  question_content: string;
  correct_answer: string;
  points: number;
  correct_responses: number;
  total_responses: number;
  correct_percentage: number;
  participants_count: number;
}

export const calculateQuestionAnalysis = (sessionId: string, examinerId: string): QuestionAnalysis[] => {
  const session = getTestSessionById(sessionId, examinerId);
  if (!session) return [];

  const template = getTemplateById(session.template_id, examinerId);
  if (!template) return [];

  const participants = getParticipantsBySession(sessionId, examinerId);
  const completedParticipants = participants.filter((p) => p.status === 'completed');

  // Collect all unique questions across all participants
  const allQuestionsMap = new Map<string, Question>();
  const questionToPoolSelectionMap = new Map<string, { poolId: string; pointsPerQuestion: number }>();

  completedParticipants.forEach((participant) => {
    const questions = getParticipantQuestions(participant.id, sessionId, examinerId);
    
    // Calculate points per question for each pool selection
    let questionIndex = 0;
    for (const poolSelection of template.poolSelections) {
      const pointsPerQuestion = Math.round(poolSelection.points / poolSelection.questionsToDraw);
      for (let i = 0; i < poolSelection.questionsToDraw; i++) {
        if (questionIndex < questions.length) {
          const question = questions[questionIndex];
          allQuestionsMap.set(question.id, question);
          // Store points per question (same for all questions from same pool selection)
          if (!questionToPoolSelectionMap.has(question.id)) {
            questionToPoolSelectionMap.set(question.id, {
              poolId: poolSelection.poolId,
              pointsPerQuestion,
            });
          }
          questionIndex++;
        }
      }
    }
  });

  // Convert map to array and analyze each question
  const allQuestions = Array.from(allQuestionsMap.values());
  
  return allQuestions.map((question, index) => {
    const correctAnswer = question.answers.find((a) => a.isCorrect);
    let correctCount = 0;
    let participantsWhoHadThisQuestion = 0;

    // Count only participants who actually received this question
    completedParticipants.forEach((participant) => {
      const participantQuestions = getParticipantQuestions(participant.id, sessionId, examinerId);
      const hasQuestion = participantQuestions.some((q) => q.id === question.id);
      
      if (hasQuestion) {
        participantsWhoHadThisQuestion++;
        const answers = participantAnswers.get(participant.id) || [];
        const answer = answers.find((a) => a.question_id === question.id);
        if (answer && answer.is_correct) {
          correctCount++;
        }
      }
    });

    const poolSelectionInfo = questionToPoolSelectionMap.get(question.id);
    const pointsPerQuestion = poolSelectionInfo?.pointsPerQuestion || 0;
    const correctPercentage = participantsWhoHadThisQuestion > 0 
      ? (correctCount / participantsWhoHadThisQuestion) * 100 
      : 0;

    return {
      question_id: question.id,
      question_number: index + 1,
      question_content: question.content,
      correct_answer: correctAnswer?.text || 'N/A',
      points: pointsPerQuestion,
      correct_responses: correctCount,
      total_responses: participantsWhoHadThisQuestion,
      correct_percentage: Math.round(correctPercentage * 100) / 100,
      participants_count: participantsWhoHadThisQuestion,
    };
  });
};

// Get participant details with answers
export interface ParticipantDetail {
  participant: Participant;
  answers: ParticipantAnswer[];
  questions: Question[];
}

export const getParticipantDetails = (
  sessionId: string,
  participantId: string,
  examinerId: string
): ParticipantDetail | null => {
  const session = getTestSessionById(sessionId, examinerId);
  if (!session) return null;

  const participant = mockParticipants.find(
    (p) => p.id === participantId && p.session_id === sessionId
  );
  if (!participant) return null;

  const answers = participantAnswers.get(participantId) || [];
  const questions = getParticipantQuestions(participantId, sessionId, examinerId);

  return {
    participant,
    answers,
    questions,
  };
};

