import { v4 as uuidv4 } from 'uuid';
import * as useCases from './useCases';
import { createInMemoryQuestionRepository, createSupabaseQuestionRepository, QuestionRepository, createInMemoryTemplateRepository, createSupabaseTemplateRepository, TemplateRepository } from './repository';
import { SupabaseClient } from '@supabase/supabase-js';

export type DesignModuleConfig = {
  supabaseClient?: SupabaseClient;
  idGenerator?: () => string;
  now?: () => Date;
  randomSelector?: <T>(items: T[], count: number) => T[];
  answerShuffler?: <T>(items: T[]) => T[];
};

export const configureDesignModule = (config: DesignModuleConfig = {}) => {
  const repo: QuestionRepository = config.supabaseClient
    ? createSupabaseQuestionRepository(config.supabaseClient)
    : createInMemoryQuestionRepository();

  const templateRepo: TemplateRepository = config.supabaseClient
    ? createSupabaseTemplateRepository(config.supabaseClient)
    : createInMemoryTemplateRepository();

  const idGenerator = config.idGenerator ?? uuidv4;
  const now = config.now ?? (() => new Date());

  return {
    createQuestion: useCases.createQuestion({ repo, idGenerator, now }),
    updateQuestion: useCases.updateQuestion({ repo, now }),
    deleteQuestion: useCases.deleteQuestion({ repo, templateRepo }),
    getQuestion: useCases.getQuestion({ repo }),
    listQuestions: useCases.listQuestions({ repo }),
    createTemplate: useCases.createTemplate({ templateRepo, questionRepo: repo, idGenerator, now }),
    updateTemplate: useCases.updateTemplate({ templateRepo, questionRepo: repo, idGenerator, now }),
    deleteTemplate: useCases.deleteTemplate({ templateRepo }),
    getTemplate: useCases.getTemplate({ templateRepo }),
    getTemplatesByIds: useCases.getTemplatesByIds({ templateRepo }),
    listTemplates: useCases.listTemplates({ templateRepo }),
    materializeTemplate: useCases.materializeTemplate({
      templateRepo,
      questionRepo: repo,
      idGenerator,
      now,
      randomSelector: config.randomSelector,
      answerShuffler: config.answerShuffler
    }),
  };
};

export type DesignModule = ReturnType<typeof configureDesignModule>;

export * from './types/testTemplate';
export * from './types/testContentPackage';
