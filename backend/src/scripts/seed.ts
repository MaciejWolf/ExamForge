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

  const designModule = configureDesignModule({
    supabaseClient,
  });

  const createQuestionData = (
    text: string,
    answers: Array<{ text: string; isCorrect?: boolean }>,
    tags: string[]
  ): CreateQuestionCommand => {
    const answerObjects = answers.map((answer) => ({
      id: uuidv4(),
      text: answer.text,
    }));

    const correctAnswer = answers.findIndex((a) => a.isCorrect ?? false);
    const correctAnswerId = correctAnswer >= 0 ? answerObjects[correctAnswer].id : answerObjects[0].id;

    return {
      text,
      answers: answerObjects,
      correctAnswerId,
      tags,
    };
  };

  const sampleQuestions: CreateQuestionCommand[] = [
    createQuestionData(
      'What is the capital of France?',
      [
        { text: 'Paris', isCorrect: true },
        { text: 'London' },
        { text: 'Berlin' },
        { text: 'Madrid' },
      ],
      ['geography', 'europe', 'easy']
    ),
    createQuestionData(
      'Which programming language is known for its use in web development?',
      [
        { text: 'JavaScript', isCorrect: true },
        { text: 'Python' },
        { text: 'C++' },
        { text: 'Java' },
      ],
      ['programming', 'web-development', 'easy']
    ),
    createQuestionData(
      'What is the result of 2 + 2 * 3?',
      [
        { text: '8', isCorrect: true },
        { text: '12' },
        { text: '10' },
        { text: '6' },
      ],
      ['math', 'arithmetic', 'medium']
    ),
    createQuestionData(
      'What does HTTP stand for?',
      [
        { text: 'HyperText Transfer Protocol', isCorrect: true },
        { text: 'High Transfer Text Protocol' },
        { text: 'Hyperlink Text Transfer Protocol' },
        { text: 'HyperText Transmission Protocol' },
      ],
      ['networking', 'web-development', 'medium']
    ),
    createQuestionData(
      'Which data structure follows LIFO (Last In First Out) principle?',
      [
        { text: 'Stack', isCorrect: true },
        { text: 'Queue' },
        { text: 'Array' },
        { text: 'Linked List' },
      ],
      ['programming', 'data-structures', 'medium']
    ),
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const questionData of sampleQuestions) {
    try {
      const result = await designModule.createQuestion(questionData);

      if (result.ok) {
        console.log(`✅ Created question: "${questionData.text}"`);
        successCount++;
      } else {
        console.error(`❌ Failed to create question: "${questionData.text}"`);
        const errorMessage =
          result.error.type === 'InvalidQuestionData'
            ? result.error.message
            : result.error.type;
        console.error(`   Error: ${errorMessage}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Exception creating question: "${questionData.text}"`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Seed Summary:`);
  console.log(`   ✅ Successfully created: ${successCount} questions`);
  console.log(`   ❌ Failed: ${errorCount} questions`);
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
