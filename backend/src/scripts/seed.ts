import dotenv from 'dotenv';
import { createSupabaseClient } from '../lib/supabase';
import { configureDesignModule } from '../design/index';
import { CreateQuestionCommand, CreateTemplateCommand } from '../design/useCases';
import { v4 as uuidv4 } from 'uuid';
import { allQuestions, testTemplates } from './seeds/index';
// When creating test sessions, import deterministic helpers:
// import { createSeededRandomSelector, createSeededAnswerShuffler } from '../design/useCases/shared/deterministicHelpers';
// import { hashString } from '../shared/seededRandom';

dotenv.config();

const cleanDatabase = async (supabaseClient: ReturnType<typeof createSupabaseClient>) => {
  console.log('🧹 Cleaning database...\n');

  // Delete all templates first (they may reference questions)
  const { data: templates, error: fetchTemplatesError } = await supabaseClient
    .from('templates')
    .select('id');

  if (fetchTemplatesError) {
    console.error('❌ Error fetching templates:', fetchTemplatesError);
    throw new Error('Could not fetch templates for cleanup');
  }

  if (templates && templates.length > 0) {
    const templateIds = templates.map(t => t.id);
    const { error: templateError } = await supabaseClient
      .from('templates')
      .delete()
      .in('id', templateIds);

    if (templateError) {
      console.error('❌ Error cleaning templates:', templateError);
      throw new Error('Could not clean templates');
    }
    console.log(`   🗑️  Deleted ${templateIds.length} template(s)`);
  }

  // Delete all questions
  const { data: questions, error: fetchQuestionsError } = await supabaseClient
    .from('questions')
    .select('id');

  if (fetchQuestionsError) {
    console.error('❌ Error fetching questions:', fetchQuestionsError);
    throw new Error('Could not fetch questions for cleanup');
  }

  if (questions && questions.length > 0) {
    const questionIds = questions.map(q => q.id);
    const { error: questionError } = await supabaseClient
      .from('questions')
      .delete()
      .in('id', questionIds);

    if (questionError) {
      console.error('❌ Error cleaning questions:', questionError);
      throw new Error('Could not clean questions');
    }
    console.log(`   🗑️  Deleted ${questionIds.length} question(s)`);
  }

  console.log('✅ Database cleaned successfully\n');
};

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

  // Clean database before seeding
  await cleanDatabase(supabaseClient);

  const designModule = configureDesignModule({
    supabaseClient,
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

  const seedIdToDbIdMap = new Map<string, string>();
  let successCount = 0;
  let errorCount = 0;
  const categoryCounts: Record<string, number> = {};

  console.log(`📚 Seeding ${allQuestions.length} questions across ${new Set(allQuestions.map(q => q.category)).size} categories...\n`);

  for (const question of allQuestions) {
    try {
      const result = await createQuestionWithDate(
        question.text,
        question.answers,
        question.tags,
        question.createdAt
      );

      if (result.ok) {
        if (question.id) {
            seedIdToDbIdMap.set(question.id, result.value.id);
        }
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

  if (seedIdToDbIdMap.size > 0) {
      console.log(`\n🔗 Mapped ${seedIdToDbIdMap.size} seed IDs to DB IDs.`);
  }

  return { seedIdToDbIdMap, designModule };
};

const seedTestTemplates = async (
  seedIdToDbIdMap: Map<string, string>,
  designModule: ReturnType<typeof configureDesignModule>
) => {
  console.log(`\n📄 Seeding ${testTemplates.length} test templates...`);
  let templateSuccessCount = 0;
  let templateErrorCount = 0;

  for (const template of testTemplates) {
    try {
      const command: CreateTemplateCommand = {
        name: template.name,
        description: template.description,
        pools: template.pools.map(pool => ({
          name: pool.name,
          questionsToDraw: pool.questionsToDraw,
          points: pool.points,
          questionIds: pool.questionSeedIds
            .map(seedId => seedIdToDbIdMap.get(seedId))
            .filter((id): id is string => !!id),
        })),
      };

      const result = await designModule.createTemplate(command);

      if (result.ok) {
        console.log(`✅ Created template: "${template.name}"`);
        templateSuccessCount++;
      } else {
        console.error(`❌ Failed to create template: "${template.name}"`);
        const errorMessage =
          result.error.type === 'InvalidQuestionData'
            ? result.error.message
            : result.error.type;
        console.error(`   Error: ${errorMessage}`);
        templateErrorCount++;
      }
    } catch (error) {
      console.error(`❌ Exception creating template: "${template.name}"`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      templateErrorCount++;
    }
  }

  console.log(`\n📊 Template Seed Summary:`);
  console.log(`   ✅ Successfully created: ${templateSuccessCount} templates`);
  console.log(`   ❌ Failed: ${templateErrorCount} templates`);
};

const seed = async () => {
  const { seedIdToDbIdMap, designModule } = await seedQuestions();
  await seedTestTemplates(seedIdToDbIdMap, designModule);
  
  // TODO: When creating test sessions (seed-active-sessions, seed-completed-sessions plans):
  // Use deterministic helpers to ensure repeatable question selection and answer shuffling:
  // 
  // const sessionId = 'some-session-id';
  // const seed = hashString(sessionId);
  // const deterministicDesignModule = configureDesignModule({
  //   supabaseClient,
  //   randomSelector: createSeededRandomSelector(seed),
  //   answerShuffler: createSeededAnswerShuffler(seed),
  // });
  // 
  // Then use deterministicDesignModule.materializeTemplate() when creating test instances
  
  console.log(`\n✨ Seed process completed!`);
};

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  });
