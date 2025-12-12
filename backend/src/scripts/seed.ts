import dotenv from 'dotenv';
import { createSupabaseClient } from '../lib/supabase';
import { configureDesignModule } from '../design/index';
import { CreateQuestionCommand, CreateTemplateCommand } from '../design/useCases';
import { v4 as uuidv4 } from 'uuid';
import { allQuestions, testTemplates } from './seeds/index';
import { activeSessions } from './seeds/sessions/activeSessions';
import { completedSessions } from './seeds/sessions/completedSessions';
import { futureSessions } from './seeds/sessions/futureSessions';
import { configureAssessmentModule } from '../assessment/index';
import { createSeededRandomSelector, createSeededAnswerShuffler } from '../design/useCases/shared/deterministicHelpers';
import { hashString, createSeededRng } from '../shared/seededRandom';
import type { Result } from '../shared/result';
import type { TestContentPackage } from '../design/types/testContentPackage';
import type { DesignError } from '../design/types/designError';
import type { TestSession } from '../assessment/types/testSession';
import type { TestInstance } from '../assessment/types/testInstance';

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

  // Delete test instances first (they reference sessions)
  const { data: testInstances, error: fetchInstancesError } = await supabaseClient
    .from('test_instances')
    .select('id');

  if (fetchInstancesError) {
    console.error('❌ Error fetching test instances:', fetchInstancesError);
    throw new Error('Could not fetch test instances for cleanup');
  }

  if (testInstances && testInstances.length > 0) {
    const instanceIds = testInstances.map(i => i.id);
    const { error: instanceError } = await supabaseClient
      .from('test_instances')
      .delete()
      .in('id', instanceIds);

    if (instanceError) {
      console.error('❌ Error cleaning test instances:', instanceError);
      throw new Error('Could not clean test instances');
    }
    console.log(`   🗑️  Deleted ${instanceIds.length} test instance(s)`);
  }

  // Delete test sessions (they reference templates)
  const { data: sessions, error: fetchSessionsError } = await supabaseClient
    .from('test_sessions')
    .select('id');

  if (fetchSessionsError) {
    console.error('❌ Error fetching test sessions:', fetchSessionsError);
    throw new Error('Could not fetch test sessions for cleanup');
  }

  if (sessions && sessions.length > 0) {
    const sessionIds = sessions.map(s => s.id);
    const { error: sessionError } = await supabaseClient
      .from('test_sessions')
      .delete()
      .in('id', sessionIds);

    if (sessionError) {
      console.error('❌ Error cleaning test sessions:', sessionError);
      throw new Error('Could not clean test sessions');
    }
    console.log(`   🗑️  Deleted ${sessionIds.length} test session(s)`);
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

const seedQuestions = async (supabaseClient: ReturnType<typeof createSupabaseClient>) => {
  console.log('🌱 Starting seed process...\n');

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
  supabaseClient: ReturnType<typeof createSupabaseClient>,
  seedIdToDbIdMap: Map<string, string>,
  designModule: ReturnType<typeof configureDesignModule>
): Promise<Map<string, string>> => {
  console.log(`\n📄 Seeding ${testTemplates.length} test templates...`);
  let templateSuccessCount = 0;
  let templateErrorCount = 0;
  const templateNameToIdMap = new Map<string, string>();

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
        templateNameToIdMap.set(template.name, result.value.id);
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

  return templateNameToIdMap;
};

const seedActiveSessions = async (
  supabaseClient: ReturnType<typeof createSupabaseClient>,
  templateNameToIdMap: Map<string, string>
) => {
  console.log(`\n🎯 Seeding ${activeSessions.length} active test sessions...`);

  let sessionSuccessCount = 0;
  let sessionErrorCount = 0;
  const sessionSummaries: Array<{
    sessionId: string;
    templateName: string;
    participantCount: number;
    accessCodes: Map<string, string>
  }> = [];

  for (const sessionSeed of activeSessions) {
    try {
      const templateId = templateNameToIdMap.get(sessionSeed.templateName);
      if (!templateId) {
        console.error(`❌ Template not found: "${sessionSeed.templateName}"`);
        sessionErrorCount++;
        continue;
      }

      // Prepare participant identifiers and seed mapping
      const participantIdentifiers = sessionSeed.participants.map(p => p.name);
      const participantSeedMap = new Map<string, string>();
      sessionSeed.participants.forEach(p => {
        participantSeedMap.set(p.name, p.seed);
      });

      // Create materializeTemplate function that uses participant-specific seeds
      // Since startSession calls materializeTemplate in a loop, we need to track
      // which participant we're on. We'll create a closure that tracks the call order.
      let participantIndex = 0;
      const materializeTemplate = async (templateId: string): Promise<Result<TestContentPackage, DesignError>> => {
        const participantName = participantIdentifiers[participantIndex];
        const participantSeed = participantSeedMap.get(participantName);

        if (!participantSeed) {
          throw new Error(`No seed found for participant: ${participantName}`);
        }

        // Create deterministic design module for this specific participant
        const participantBaseSeed = hashString(participantSeed);
        const participantDesignModule = configureDesignModule({
          supabaseClient,
          randomSelector: createSeededRandomSelector(participantBaseSeed),
          answerShuffler: createSeededAnswerShuffler(participantBaseSeed),
        });

        participantIndex++;
        return await participantDesignModule.materializeTemplate(templateId);
      };

      // Configure assessment module with deterministic materializeTemplate
      const assessmentModule = configureAssessmentModule({
        supabaseClient,
        materializeTemplate,
        templateProvider: {
          getTemplateNames: async (templateIds: string[]) => {
            const nameMap = new Map<string, string>();
            for (const id of templateIds) {
              for (const [name, mappedId] of templateNameToIdMap.entries()) {
                if (mappedId === id) {
                  nameMap.set(id, name);
                  break;
                }
              }
            }
            return nameMap;
          },
        },
      });

      // Start the session
      const result = await assessmentModule.startSession({
        templateId,
        examinerId: sessionSeed.examinerId,
        timeLimitMinutes: sessionSeed.timeLimitMinutes,
        startTime: sessionSeed.startTime,
        endTime: sessionSeed.endTime,
        participantIdentifiers,
      });

      if (result.ok) {
        // Get access codes for logging by fetching the session
        const sessionResult = await assessmentModule.getSessionById(result.value);
        const accessCodes = new Map<string, string>();

        if (sessionResult.ok && sessionResult.value.instances) {
          sessionResult.value.instances.forEach(instance => {
            accessCodes.set(instance.identifier, instance.accessCode);
          });
        }

        sessionSummaries.push({
          sessionId: result.value,
          templateName: sessionSeed.templateName,
          participantCount: participantIdentifiers.length,
          accessCodes,
        });

        console.log(`✅ Created session: "${sessionSeed.templateName}" (${participantIdentifiers.length} participants)`);
        sessionSuccessCount++;
      } else {
        console.error(`❌ Failed to create session: "${sessionSeed.templateName}"`);
        console.error(`   Error: ${result.error.type}`);
        sessionErrorCount++;
      }
    } catch (error) {
      console.error(`❌ Exception creating session: "${sessionSeed.templateName}"`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      sessionErrorCount++;
    }
  }

  console.log(`\n📊 Active Sessions Seed Summary:`);
  console.log(`   ✅ Successfully created: ${sessionSuccessCount} sessions`);
  console.log(`   ❌ Failed: ${sessionErrorCount} sessions`);

  if (sessionSummaries.length > 0) {
    console.log(`\n📋 Seeded Active Sessions:`);
    for (const summary of sessionSummaries) {
      console.log(`   • ${summary.templateName}`);
      console.log(`     Session ID: ${summary.sessionId}`);
      console.log(`     Participants: ${summary.participantCount}`);
      if (summary.accessCodes.size > 0) {
        console.log(`     Access Codes:`);
        for (const [participant, code] of summary.accessCodes.entries()) {
          console.log(`       - ${participant}: ${code}`);
        }
      }
    }
  }
};

const seedCompletedSessions = async (
  supabaseClient: ReturnType<typeof createSupabaseClient>,
  templateNameToIdMap: Map<string, string>
) => {
  console.log(`\n📜 Seeding ${completedSessions.length} completed test sessions...`);

  let sessionSuccessCount = 0;
  let sessionErrorCount = 0;
  const sessionSummaries: Array<{
    sessionId: string;
    templateName: string;
    status: 'completed' | 'aborted';
    participantCount: number;
  }> = [];

  for (const sessionSeed of completedSessions) {
    try {
      const templateId = templateNameToIdMap.get(sessionSeed.templateName);
      if (!templateId) {
        console.error(`❌ Template not found: "${sessionSeed.templateName}"`);
        sessionErrorCount++;
        continue;
      }

      // Prepare participant identifiers and seed mapping
      const participantIdentifiers = sessionSeed.participants.map(p => p.name);
      const participantSeedMap = new Map<string, string>();
      const participantCompletionMap = new Map<string, number>();
      sessionSeed.participants.forEach(p => {
        participantSeedMap.set(p.name, p.seed);
        participantCompletionMap.set(p.name, p.completionPercentage);
      });

      // Create materializeTemplate function that uses participant-specific seeds
      let participantIndex = 0;
      const materializeTemplate = async (templateId: string): Promise<Result<TestContentPackage, DesignError>> => {
        const participantName = participantIdentifiers[participantIndex];
        const participantSeed = participantSeedMap.get(participantName);

        if (!participantSeed) {
          throw new Error(`No seed found for participant: ${participantName}`);
        }

        // Create deterministic design module for this specific participant
        const participantBaseSeed = hashString(participantSeed);
        const participantDesignModule = configureDesignModule({
          supabaseClient,
          randomSelector: createSeededRandomSelector(participantBaseSeed),
          answerShuffler: createSeededAnswerShuffler(participantBaseSeed),
        });

        participantIndex++;
        return await participantDesignModule.materializeTemplate(templateId);
      };

      // Configure assessment module with deterministic materializeTemplate
      const assessmentModule = configureAssessmentModule({
        supabaseClient,
        materializeTemplate,
        templateProvider: {
          getTemplateNames: async (templateIds: string[]) => {
            const nameMap = new Map<string, string>();
            for (const id of templateIds) {
              for (const [name, mappedId] of templateNameToIdMap.entries()) {
                if (mappedId === id) {
                  nameMap.set(id, name);
                  break;
                }
              }
            }
            return nameMap;
          },
        },
      });

      // Start the session
      const result = await assessmentModule.startSession({
        templateId,
        examinerId: sessionSeed.examinerId,
        timeLimitMinutes: sessionSeed.timeLimitMinutes,
        startTime: sessionSeed.startTime,
        endTime: sessionSeed.endTime,
        participantIdentifiers,
      });

      if (!result.ok) {
        console.error(`❌ Failed to create session: "${sessionSeed.templateName}"`);
        console.error(`   Error: ${result.error.type}`);
        sessionErrorCount++;
        continue;
      }

      const sessionId = result.value;

      // Update session status
      const { data: sessionData, error: sessionFetchError } = await supabaseClient
        .from('test_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionFetchError || !sessionData) {
        console.error(`❌ Failed to fetch session for status update: "${sessionSeed.templateName}"`);
        sessionErrorCount++;
        continue;
      }

      const sessionDoc = sessionData as { id: string; data: TestSession };
      const updatedSession = {
        ...sessionDoc.data,
        status: sessionSeed.status,
        updatedAt: new Date(),
      };

      const { error: sessionUpdateError } = await supabaseClient
        .from('test_sessions')
        .update({ data: updatedSession })
        .eq('id', sessionId);

      if (sessionUpdateError) {
        console.error(`❌ Failed to update session status: "${sessionSeed.templateName}"`);
        console.error(`   Error: ${sessionUpdateError.message}`);
        sessionErrorCount++;
        continue;
      }

      // Get all instances for this session
      const { data: instanceData, error: instanceFetchError } = await supabaseClient
        .from('test_instances')
        .select('*')
        .eq('data->>sessionId', sessionId);

      if (instanceFetchError) {
        console.error(`❌ Failed to fetch instances: "${sessionSeed.templateName}"`);
        sessionErrorCount++;
        continue;
      }

      // Update instances with startedAt, completedAt, answers, and scores
      const instanceUpdates: Array<{ id: string; data: TestInstance }> = [];

      for (const instanceDoc of instanceData as Array<{ id: string; data: TestInstance }>) {
        const instance = instanceDoc.data;
        const participant = sessionSeed.participants.find(p => p.name === instance.identifier);

        if (!participant) {
          continue;
        }

        // Calculate actual start time (session start + offset)
        const actualStartTime = new Date(sessionSeed.startTime);
        actualStartTime.setMinutes(actualStartTime.getMinutes() + participant.startTimeOffsetMinutes);

        // Calculate completion time
        let completedAt: Date | undefined;
        if (sessionSeed.status === 'completed') {
          // For completed sessions, set completedAt to endTime (or slightly before for realism)
          completedAt = new Date(sessionSeed.endTime);
          // Subtract a few minutes to make it more realistic (participants finish before deadline)
          completedAt.setMinutes(completedAt.getMinutes() - Math.floor(Math.random() * 10));
        } else if (sessionSeed.status === 'aborted' && sessionSeed.abortTime) {
          // For aborted sessions, only mark as completed if they reached 100%
          // Otherwise, they were interrupted mid-test
          if (participant.completionPercentage >= 100) {
            completedAt = new Date(sessionSeed.abortTime);
            completedAt.setMinutes(completedAt.getMinutes() - 5); // Finished just before abort
          }
          // If less than 100%, leave completedAt undefined (in progress when aborted)
        }

        // Generate answers and calculate score
        const answers: Record<string, string> = {};
        let totalScore = 0;
        let maxScore = 0;

        // Flatten all questions from all sections with correct point distribution
        const allQuestionsWithPoints = instance.testContent.sections.flatMap(section => {
          const questionsInSection = section.questions.length;
          if (questionsInSection === 0) return [];

          const pointsPerQuestion = section.points / questionsInSection;
          return section.questions.map(q => ({
            question: q,
            points: pointsPerQuestion
          }));
        });

        // Calculate total possible score
        maxScore = instance.testContent.sections.reduce((sum, section) => sum + section.points, 0);

        // Determine how many questions to answer based on completionPercentage
        const questionsToAnswerCount = Math.floor(allQuestionsWithPoints.length * (participant.completionPercentage / 100));

        // Create a seeded RNG for consistent answer generation
        const answerRng = createSeededRng(`${participant.seed}-answers`);

        // Answer the first N questions (simulating linear progress)
        for (let i = 0; i < questionsToAnswerCount; i++) {
          const { question, points } = allQuestionsWithPoints[i];

          // 80% chance of being correct
          const isCorrect = answerRng() < 0.8;

          if (isCorrect) {
            answers[question.id] = question.correctAnswerId;
            totalScore += points;
          } else {
            // Pick a wrong answer
            const wrongAnswers = question.answers.filter(a => a.id !== question.correctAnswerId);
            if (wrongAnswers.length > 0) {
              const wrongIndex = Math.floor(answerRng() * wrongAnswers.length);
              answers[question.id] = wrongAnswers[wrongIndex].id;
            } else {
              // Fallback if no wrong answers exist (rare)
              answers[question.id] = question.correctAnswerId;
              totalScore += points;
            }
          }
        }

        const updatedInstance: TestInstance = {
          ...instance,
          startedAt: actualStartTime,
          completedAt: completedAt,
          answers,
          totalScore,
          maxScore,
        };

        instanceUpdates.push({
          id: instanceDoc.id,
          data: updatedInstance,
        });
      }

      // Update all instances
      for (const update of instanceUpdates) {
        const { error: instanceUpdateError } = await supabaseClient
          .from('test_instances')
          .update({ data: update.data })
          .eq('id', update.id);

        if (instanceUpdateError) {
          console.error(`❌ Failed to update instance ${update.id}: ${instanceUpdateError.message}`);
        }
      }

      sessionSummaries.push({
        sessionId,
        templateName: sessionSeed.templateName,
        status: sessionSeed.status,
        participantCount: participantIdentifiers.length,
      });

      const statusEmoji = sessionSeed.status === 'completed' ? '✅' : '⚠️';
      console.log(`${statusEmoji} Created ${sessionSeed.status} session: "${sessionSeed.templateName}" (${participantIdentifiers.length} participants)`);
      sessionSuccessCount++;
    } catch (error) {
      console.error(`❌ Exception creating session: "${sessionSeed.templateName}"`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      sessionErrorCount++;
    }
  }

  console.log(`\n📊 Completed Sessions Seed Summary:`);
  console.log(`   ✅ Successfully created: ${sessionSuccessCount} sessions`);
  console.log(`   ❌ Failed: ${sessionErrorCount} sessions`);

  if (sessionSummaries.length > 0) {
    console.log(`\n📋 Seeded Completed Sessions:`);
    // Sort by date (oldest first)
    const sortedSummaries = sessionSummaries.sort((a, b) => {
      // We'll sort by template name for now since we don't have dates in summary
      return a.templateName.localeCompare(b.templateName);
    });
    for (const summary of sortedSummaries) {
      const statusLabel = summary.status === 'completed' ? 'Completed' : 'Aborted';
      console.log(`   • ${summary.templateName} [${statusLabel}]`);
      console.log(`     Session ID: ${summary.sessionId}`);
      console.log(`     Participants: ${summary.participantCount}`);
    }
  }
};

const seedFutureSessions = async (
  supabaseClient: ReturnType<typeof createSupabaseClient>,
  templateNameToIdMap: Map<string, string>
) => {
  console.log(`\n📅 Seeding ${futureSessions.length} future test sessions...`);

  let sessionSuccessCount = 0;
  let sessionErrorCount = 0;
  const sessionSummaries: Array<{
    sessionId: string;
    templateName: string;
    scheduledTime: string;
    participantCount: number;
    accessCodes: Map<string, string>
  }> = [];

  for (const sessionSeed of futureSessions) {
    try {
      const templateId = templateNameToIdMap.get(sessionSeed.templateName);
      if (!templateId) {
        console.error(`❌ Template not found: "${sessionSeed.templateName}"`);
        sessionErrorCount++;
        continue;
      }

      // Prepare participant identifiers and seed mapping
      const participantIdentifiers = sessionSeed.participants.map(p => p.name);
      const participantSeedMap = new Map<string, string>();
      sessionSeed.participants.forEach(p => {
        participantSeedMap.set(p.name, p.seed);
      });

      // Create materializeTemplate function that uses participant-specific seeds
      let participantIndex = 0;
      const materializeTemplate = async (templateId: string): Promise<Result<TestContentPackage, DesignError>> => {
        const participantName = participantIdentifiers[participantIndex];
        const participantSeed = participantSeedMap.get(participantName);

        if (!participantSeed) {
          throw new Error(`No seed found for participant: ${participantName}`);
        }

        // Create deterministic design module for this specific participant
        const participantBaseSeed = hashString(participantSeed);
        const participantDesignModule = configureDesignModule({
          supabaseClient,
          randomSelector: createSeededRandomSelector(participantBaseSeed),
          answerShuffler: createSeededAnswerShuffler(participantBaseSeed),
        });

        participantIndex++;
        return await participantDesignModule.materializeTemplate(templateId);
      };

      // Configure assessment module with deterministic materializeTemplate
      const assessmentModule = configureAssessmentModule({
        supabaseClient,
        materializeTemplate,
        templateProvider: {
          getTemplateNames: async (templateIds: string[]) => {
            const nameMap = new Map<string, string>();
            for (const id of templateIds) {
              for (const [name, mappedId] of templateNameToIdMap.entries()) {
                if (mappedId === id) {
                  nameMap.set(id, name);
                  break;
                }
              }
            }
            return nameMap;
          },
        },
      });

      // Start the session (status will be 'open' automatically since dates are in future)
      const result = await assessmentModule.startSession({
        templateId,
        examinerId: sessionSeed.examinerId,
        timeLimitMinutes: sessionSeed.timeLimitMinutes,
        startTime: sessionSeed.startTime,
        endTime: sessionSeed.endTime,
        participantIdentifiers,
      });

      if (result.ok) {
        // Get access codes for logging by fetching the session
        const sessionResult = await assessmentModule.getSessionById(result.value);
        const accessCodes = new Map<string, string>();

        if (sessionResult.ok && sessionResult.value.instances) {
          sessionResult.value.instances.forEach(instance => {
            accessCodes.set(instance.identifier, instance.accessCode);
          });
        }

        // Format scheduled time for display
        const scheduledTime = `${sessionSeed.startTime.toLocaleDateString()} ${sessionSeed.startTime.toLocaleTimeString()} - ${sessionSeed.endTime.toLocaleTimeString()}`;

        sessionSummaries.push({
          sessionId: result.value,
          templateName: sessionSeed.templateName,
          scheduledTime,
          participantCount: participantIdentifiers.length,
          accessCodes,
        });

        console.log(`✅ Created future session: "${sessionSeed.templateName}" (${participantIdentifiers.length} participants)`);
        sessionSuccessCount++;
      } else {
        console.error(`❌ Failed to create future session: "${sessionSeed.templateName}"`);
        console.error(`   Error: ${result.error.type}`);
        sessionErrorCount++;
      }
    } catch (error) {
      console.error(`❌ Exception creating future session: "${sessionSeed.templateName}"`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      sessionErrorCount++;
    }
  }

  console.log(`\n📊 Future Sessions Seed Summary:`);
  console.log(`   ✅ Successfully created: ${sessionSuccessCount} sessions`);
  console.log(`   ❌ Failed: ${sessionErrorCount} sessions`);

  if (sessionSummaries.length > 0) {
    console.log(`\n📋 Seeded Future Sessions:`);
    for (const summary of sessionSummaries) {
      console.log(`   • ${summary.templateName}`);
      console.log(`     Session ID: ${summary.sessionId}`);
      console.log(`     Scheduled: ${summary.scheduledTime}`);
      console.log(`     Participants: ${summary.participantCount}`);
      if (summary.accessCodes.size > 0) {
        console.log(`     Access Codes:`);
        for (const [participant, code] of summary.accessCodes.entries()) {
          console.log(`       - ${participant}: ${code}`);
        }
      }
    }
  }
};

const seed = async () => {
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

  const { seedIdToDbIdMap, designModule } = await seedQuestions(supabaseClient);
  const templateNameToIdMap = await seedTestTemplates(supabaseClient, seedIdToDbIdMap, designModule);

  // Seed active sessions
  await seedActiveSessions(supabaseClient, templateNameToIdMap);

  // Seed completed sessions (oldest first)
  await seedCompletedSessions(supabaseClient, templateNameToIdMap);

  // Seed future sessions (scheduled but not started)
  await seedFutureSessions(supabaseClient, templateNameToIdMap);

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
