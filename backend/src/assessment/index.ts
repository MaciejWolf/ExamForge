import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';
import * as useCases from './useCases';
import {
  SessionRepository,
  TestInstanceRepository,
  createInMemorySessionRepository,
  createInMemoryTestInstanceRepository,
  createSupabaseSessionRepository,
  createSupabaseTestInstanceRepository
} from './repository';
import { Result } from '../shared/result';
import { TestContentPackage } from '../design/types/testContentPackage';
import { DesignError } from '../design/types/designError';
import {
  TemplateRepository,
  createInMemoryTemplateRepository,
  createSupabaseTemplateRepository
} from '../design/repository';

type MaterializeTemplateFn = (templateId: string) => Promise<Result<TestContentPackage, DesignError>>;

import { TemplateProvider } from './useCases/listSessions';

export type AssessmentModuleConfig = {
  supabaseClient?: SupabaseClient;
  idGenerator?: () => string;
  accessCodeGenerator?: () => string;
  now?: () => Date;
  materializeTemplate: MaterializeTemplateFn;
  templateProvider: TemplateProvider;
  // Allow overriding repositories generic interface (for testing or specific needs)
  sessionRepo?: SessionRepository;
  testInstanceRepo?: TestInstanceRepository;
  templateRepo?: TemplateRepository;
};

// Default Access Code Generator
const defaultAccessCodeGenerator = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const configureAssessmentModule = (config: AssessmentModuleConfig) => {
  const idGenerator = config.idGenerator ?? uuidv4;
  const accessCodeGenerator = config.accessCodeGenerator ?? defaultAccessCodeGenerator;
  const now = config.now ?? (() => new Date());

  let sessionRepo: SessionRepository;
  let testInstanceRepo: TestInstanceRepository;

  if (config.sessionRepo) {
    sessionRepo = config.sessionRepo;
  } else if (config.supabaseClient) {
    sessionRepo = createSupabaseSessionRepository(config.supabaseClient);
  } else {
    sessionRepo = createInMemorySessionRepository();
  }

  if (config.testInstanceRepo) {
    testInstanceRepo = config.testInstanceRepo;
  } else if (config.supabaseClient) {
    testInstanceRepo = createSupabaseTestInstanceRepository(config.supabaseClient);
  } else {
    testInstanceRepo = createInMemoryTestInstanceRepository();
  }

  let templateRepo: TemplateRepository;
  if (config.templateRepo) {
    templateRepo = config.templateRepo;
  } else if (config.supabaseClient) {
    templateRepo = createSupabaseTemplateRepository(config.supabaseClient);
  } else {
    templateRepo = createInMemoryTemplateRepository();
  }

  return {
    startSession: useCases.startSession({
      sessionRepo,
      testInstanceRepo,
      materializeTemplate: config.materializeTemplate,
      idGenerator,
      accessCodeGenerator,
      now
    }),
    listSessions: useCases.listSessions({
      sessionRepo,
      testInstanceRepo,
      templateProvider: config.templateProvider
    }),
    getSessionById: useCases.getSessionById({
      sessionRepo,
      testInstanceRepo
    }),
    getSessionReport: useCases.getSessionReport({
      sessionRepo,
      templateRepo,
      testInstanceRepo,
      now
    }),
    startTestInstance: useCases.startTestInstance({
      testInstanceRepo,
      sessionRepo,
      now
    }),
    finishTestInstance: useCases.finishTestInstance({
      testInstanceRepo,
      sessionRepo,
      now
    }),
    getTestQuestions: useCases.getTestQuestions({
      testInstanceRepo,
      sessionRepo,
      now
    })
  };
};

export type AssessmentModule = ReturnType<typeof configureAssessmentModule>;
