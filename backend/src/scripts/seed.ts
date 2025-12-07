import dotenv from 'dotenv';
import { createSupabaseClient } from '../lib/supabase';
import { configureDesignModule } from '../design/index';
import { CreateQuestionCommand } from '../design/useCases';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const seedQuestions = async () => {
  console.log('🌱 Starting seed process...\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
    process.exit(1);
  }

  const supabaseClient = createSupabaseClient({
    supabaseUrl,
    supabaseAnonKey,
  });

  const createQuestionWithDate = async (
    text: string,
    answers: Array<{ text: string; isCorrect?: boolean }>,
    tags: string[],
    createdAt: Date
  ) => {
    const answerObjects = answers.map((answer) => ({
      id: uuidv4(),
      text: answer.text,
    }));

    const correctAnswer = answers.findIndex((a) => a.isCorrect ?? false);
    const correctAnswerId = correctAnswer >= 0 ? answerObjects[correctAnswer].id : answerObjects[0].id;

    const questionData: CreateQuestionCommand = {
      text,
      answers: answerObjects,
      correctAnswerId,
      tags,
    };

    const moduleWithDate = configureDesignModule({
      supabaseClient,
      now: () => createdAt,
    });

    return await moduleWithDate.createQuestion(questionData);
  };

  type QuestionSeed = {
    text: string;
    answers: Array<{ text: string; isCorrect?: boolean }>;
    tags: string[];
    createdAt: Date;
    category: string;
  };

  const questions: QuestionSeed[] = [
    {
      category: 'Mathematics Basic',
      text: 'What is 2+2?',
      answers: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false },
        { text: '6', isCorrect: false },
      ],
      tags: ['mathematics', 'basic', 'arithmetic'],
      createdAt: new Date('2024-01-15'),
    },
    {
      category: 'Mathematics Basic',
      text: 'Solve: 3x = 15',
      answers: [
        { text: '3', isCorrect: false },
        { text: '5', isCorrect: true },
        { text: '12', isCorrect: false },
      ],
      tags: ['mathematics', 'basic', 'algebra'],
      createdAt: new Date('2024-01-15'),
    },
    {
      category: 'Mathematics Basic',
      text: 'What is the value of π (pi)?',
      answers: [
        { text: '3.14', isCorrect: true },
        { text: '2.71', isCorrect: false },
        { text: '1.41', isCorrect: false },
        { text: '4.13', isCorrect: false },
      ],
      tags: ['mathematics', 'basic', 'constants'],
      createdAt: new Date('2024-01-16'),
    },
    {
      category: 'Mathematics Basic',
      text: 'What is the square root of 64?',
      answers: [
        { text: '6', isCorrect: false },
        { text: '7', isCorrect: false },
        { text: '8', isCorrect: true },
        { text: '9', isCorrect: false },
      ],
      tags: ['mathematics', 'basic', 'square-root'],
      createdAt: new Date('2024-01-17'),
    },
    {
      category: 'Mathematics Basic',
      text: 'Calculate: 15 × 4',
      answers: [
        { text: '50', isCorrect: false },
        { text: '60', isCorrect: true },
        { text: '70', isCorrect: false },
        { text: '80', isCorrect: false },
      ],
      tags: ['mathematics', 'basic', 'multiplication'],
      createdAt: new Date('2024-01-18'),
    },
    {
      category: 'Mathematics Basic',
      text: "What is the area of a circle with radius 5? (Use π = 3.14)",
      answers: [
        { text: '31.4', isCorrect: false },
        { text: '78.5', isCorrect: true },
        { text: '15.7', isCorrect: false },
        { text: '25', isCorrect: false },
      ],
      tags: ['mathematics', 'basic', 'geometry', 'area'],
      createdAt: new Date('2024-01-19'),
    },
    {
      category: 'Physics Advanced',
      text: 'What is the speed of light in vacuum?',
      answers: [
        { text: '3 × 10^8 m/s', isCorrect: true },
        { text: '3 × 10^6 m/s', isCorrect: false },
        { text: '3 × 10^10 m/s', isCorrect: false },
        { text: '3 × 10^5 m/s', isCorrect: false },
      ],
      tags: ['physics', 'advanced', 'constants'],
      createdAt: new Date('2024-01-20'),
    },
    {
      category: 'Physics Advanced',
      text: "What is Newton's second law of motion?",
      answers: [
        { text: 'F = ma', isCorrect: true },
        { text: 'E = mc²', isCorrect: false },
        { text: 'PV = nRT', isCorrect: false },
        { text: 'V = IR', isCorrect: false },
      ],
      tags: ['physics', 'advanced', 'mechanics'],
      createdAt: new Date('2024-01-21'),
    },
    {
      category: 'Physics Advanced',
      text: 'What is the unit of electric current?',
      answers: [
        { text: 'Volt', isCorrect: false },
        { text: 'Ampere', isCorrect: true },
        { text: 'Ohm', isCorrect: false },
        { text: 'Watt', isCorrect: false },
      ],
      tags: ['physics', 'advanced', 'electricity'],
      createdAt: new Date('2024-01-22'),
    },
    {
      category: 'Physics Advanced',
      text: 'What is the formula for kinetic energy?',
      answers: [
        { text: 'KE = ½mv²', isCorrect: true },
        { text: 'KE = mgh', isCorrect: false },
        { text: 'KE = mv', isCorrect: false },
        { text: 'KE = ½mv', isCorrect: false },
      ],
      tags: ['physics', 'advanced', 'energy'],
      createdAt: new Date('2024-01-23'),
    },
    {
      category: 'Physics Advanced',
      text: 'What is the acceleration due to gravity on Earth?',
      answers: [
        { text: '9.8 m/s²', isCorrect: true },
        { text: '10 m/s²', isCorrect: false },
        { text: '8.9 m/s²', isCorrect: false },
        { text: '11 m/s²', isCorrect: false },
      ],
      tags: ['physics', 'advanced', 'gravity'],
      createdAt: new Date('2024-01-24'),
    },
    {
      category: 'Chemistry Foundations',
      text: 'What is the chemical symbol for water?',
      answers: [
        { text: 'H2O', isCorrect: true },
        { text: 'CO2', isCorrect: false },
        { text: 'NaCl', isCorrect: false },
        { text: 'O2', isCorrect: false },
      ],
      tags: ['chemistry', 'foundations', 'compounds'],
      createdAt: new Date('2024-02-01'),
    },
    {
      category: 'Chemistry Foundations',
      text: 'What is the atomic number of carbon?',
      answers: [
        { text: '6', isCorrect: true },
        { text: '12', isCorrect: false },
        { text: '14', isCorrect: false },
        { text: '8', isCorrect: false },
      ],
      tags: ['chemistry', 'foundations', 'atomic-number'],
      createdAt: new Date('2024-02-02'),
    },
    {
      category: 'Chemistry Foundations',
      text: 'What is the pH of a neutral solution?',
      answers: [
        { text: '5', isCorrect: false },
        { text: '7', isCorrect: true },
        { text: '9', isCorrect: false },
        { text: '14', isCorrect: false },
      ],
      tags: ['chemistry', 'foundations', 'pH'],
      createdAt: new Date('2024-02-03'),
    },
    {
      category: 'Chemistry Foundations',
      text: "What is the most abundant gas in Earth's atmosphere?",
      answers: [
        { text: 'Oxygen', isCorrect: false },
        { text: 'Nitrogen', isCorrect: true },
        { text: 'Carbon dioxide', isCorrect: false },
        { text: 'Argon', isCorrect: false },
      ],
      tags: ['chemistry', 'foundations', 'atmosphere'],
      createdAt: new Date('2024-02-04'),
    },
    {
      category: 'Chemistry Foundations',
      text: 'What type of bond is formed when electrons are shared between atoms?',
      answers: [
        { text: 'Ionic bond', isCorrect: false },
        { text: 'Covalent bond', isCorrect: true },
        { text: 'Hydrogen bond', isCorrect: false },
        { text: 'Metallic bond', isCorrect: false },
      ],
      tags: ['chemistry', 'foundations', 'bonding'],
      createdAt: new Date('2024-02-05'),
    },
    {
      category: 'Computer Science Fundamentals',
      text: 'What does HTML stand for?',
      answers: [
        { text: 'HyperText Markup Language', isCorrect: true },
        { text: 'High-Level Text Markup Language', isCorrect: false },
        { text: 'Hyperlink and Text Markup Language', isCorrect: false },
        { text: 'Home Tool Markup Language', isCorrect: false },
      ],
      tags: ['computer-science', 'fundamentals', 'web'],
      createdAt: new Date('2024-02-10'),
    },
    {
      category: 'Computer Science Fundamentals',
      text: 'What is the time complexity of binary search?',
      answers: [
        { text: 'O(n)', isCorrect: false },
        { text: 'O(log n)', isCorrect: true },
        { text: 'O(n²)', isCorrect: false },
        { text: 'O(1)', isCorrect: false },
      ],
      tags: ['computer-science', 'fundamentals', 'algorithms', 'complexity'],
      createdAt: new Date('2024-02-11'),
    },
    {
      category: 'Computer Science Fundamentals',
      text: 'What is a variable that stores a memory address called?',
      answers: [
        { text: 'Array', isCorrect: false },
        { text: 'Pointer', isCorrect: true },
        { text: 'Reference', isCorrect: false },
        { text: 'Index', isCorrect: false },
      ],
      tags: ['computer-science', 'fundamentals', 'memory'],
      createdAt: new Date('2024-02-12'),
    },
    {
      category: 'Computer Science Fundamentals',
      text: 'What does API stand for?',
      answers: [
        { text: 'Application Programming Interface', isCorrect: true },
        { text: 'Automated Program Integration', isCorrect: false },
        { text: 'Advanced Programming Interface', isCorrect: false },
        { text: 'Application Process Integration', isCorrect: false },
      ],
      tags: ['computer-science', 'fundamentals', 'api'],
      createdAt: new Date('2024-02-13'),
    },
    {
      category: 'Computer Science Fundamentals',
      text: 'Which data structure follows LIFO (Last In First Out) principle?',
      answers: [
        { text: 'Queue', isCorrect: false },
        { text: 'Stack', isCorrect: true },
        { text: 'Array', isCorrect: false },
        { text: 'Linked List', isCorrect: false },
      ],
      tags: ['computer-science', 'fundamentals', 'data-structures'],
      createdAt: new Date('2024-02-14'),
    },
    {
      category: 'History World War II',
      text: 'In which year did World War II end?',
      answers: [
        { text: '1944', isCorrect: false },
        { text: '1945', isCorrect: true },
        { text: '1946', isCorrect: false },
        { text: '1947', isCorrect: false },
      ],
      tags: ['history', 'world-war-ii'],
      createdAt: new Date('2024-02-15'),
    },
    {
      category: 'History World War II',
      text: 'Which event is considered the start of World War II in Europe?',
      answers: [
        { text: 'Invasion of Poland', isCorrect: true },
        { text: 'Attack on Pearl Harbor', isCorrect: false },
        { text: 'Battle of Britain', isCorrect: false },
        { text: 'D-Day', isCorrect: false },
      ],
      tags: ['history', 'world-war-ii', 'europe'],
      createdAt: new Date('2024-02-16'),
    },
    {
      category: 'History World War II',
      text: 'Who was the leader of Nazi Germany during World War II?',
      answers: [
        { text: 'Benito Mussolini', isCorrect: false },
        { text: 'Adolf Hitler', isCorrect: true },
        { text: 'Joseph Stalin', isCorrect: false },
        { text: 'Winston Churchill', isCorrect: false },
      ],
      tags: ['history', 'world-war-ii', 'leaders'],
      createdAt: new Date('2024-02-17'),
    },
    {
      category: 'History World War II',
      text: 'Which battle is considered the turning point of World War II in the Pacific?',
      answers: [
        { text: 'Battle of Midway', isCorrect: true },
        { text: 'Battle of Guadalcanal', isCorrect: false },
        { text: 'Battle of Iwo Jima', isCorrect: false },
        { text: 'Battle of Okinawa', isCorrect: false },
      ],
      tags: ['history', 'world-war-ii', 'pacific'],
      createdAt: new Date('2024-02-18'),
    },
    {
      category: 'Biology Cell Structure',
      text: 'What is the powerhouse of the cell?',
      answers: [
        { text: 'Nucleus', isCorrect: false },
        { text: 'Mitochondria', isCorrect: true },
        { text: 'Ribosome', isCorrect: false },
        { text: 'Golgi apparatus', isCorrect: false },
      ],
      tags: ['biology', 'cell-structure', 'cell'],
      createdAt: new Date('2024-02-20'),
    },
    {
      category: 'Biology Cell Structure',
      text: "Which organelle contains the cell's genetic material?",
      answers: [
        { text: 'Mitochondria', isCorrect: false },
        { text: 'Nucleus', isCorrect: true },
        { text: 'Endoplasmic reticulum', isCorrect: false },
        { text: 'Lysosome', isCorrect: false },
      ],
      tags: ['biology', 'cell-structure', 'cell', 'dna'],
      createdAt: new Date('2024-02-21'),
    },
    {
      category: 'Biology Cell Structure',
      text: 'What is the function of ribosomes?',
      answers: [
        { text: 'Energy production', isCorrect: false },
        { text: 'Protein synthesis', isCorrect: true },
        { text: 'DNA replication', isCorrect: false },
        { text: 'Waste removal', isCorrect: false },
      ],
      tags: ['biology', 'cell-structure', 'protein-synthesis'],
      createdAt: new Date('2024-02-22'),
    },
    {
      category: 'Biology Cell Structure',
      text: 'Which type of cell lacks a nucleus?',
      answers: [
        { text: 'Eukaryotic cell', isCorrect: false },
        { text: 'Prokaryotic cell', isCorrect: true },
        { text: 'Plant cell', isCorrect: false },
        { text: 'Animal cell', isCorrect: false },
      ],
      tags: ['biology', 'cell-structure', 'cell-types'],
      createdAt: new Date('2024-02-23'),
    },
  ];

  let successCount = 0;
  let errorCount = 0;
  const categoryCounts: Record<string, number> = {};

  console.log(`📚 Seeding ${questions.length} questions across ${new Set(questions.map(q => q.category)).size} categories...\n`);

  for (const question of questions) {
    try {
      const result = await createQuestionWithDate(
        question.text,
        question.answers,
        question.tags,
        question.createdAt
      );

      if (result.ok) {
        categoryCounts[question.category] = (categoryCounts[question.category] || 0) + 1;
        console.log(`✅ [${question.category}] Created: "${question.text}"`);
        successCount++;
      } else {
        console.error(`❌ Failed to create question: "${question.text}"`);
        const errorMessage =
          result.error.type === 'InvalidQuestionData'
            ? result.error.message
            : result.error.type;
        console.error(`   Error: ${errorMessage}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Exception creating question: "${question.text}"`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Seed Summary:`);
  console.log(`   ✅ Successfully created: ${successCount} questions`);
  console.log(`   ❌ Failed: ${errorCount} questions`);
  console.log(`\n📦 Questions by Category:`);
  for (const [category, count] of Object.entries(categoryCounts)) {
    console.log(`   • ${category}: ${count} questions`);
  }
  console.log(`\n✨ Seed process completed!`);
};

seedQuestions()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  });
