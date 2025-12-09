import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';
import * as useCases from './useCases';
import { SessionRepository, createInMemorySessionRepository, createInMemoryTestInstanceRepository } from './repository';
import { Result } from '../shared/result';
import { TestContentPackage } from '../design/types/testContentPackage';
import { DesignError } from '../design/types/designError';

type MaterializeTemplateFn = (templateId: string) => Promise<Result<TestContentPackage, DesignError>>;

export type AssessmentModuleConfig = {
  supabaseClient?: SupabaseClient;
  idGenerator?: () => string;
  accessCodeGenerator?: () => string;
  now?: () => Date;
  materializeTemplate: MaterializeTemplateFn;
  sessionRepo?: SessionRepository;
};

// Default Access Code Generator
const defaultAccessCodeGenerator = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const configureAssessmentModule = (config: AssessmentModuleConfig) => {
  const idGenerator = config.idGenerator ?? uuidv4;
  const accessCodeGenerator = config.accessCodeGenerator ?? defaultAccessCodeGenerator;
  const now = config.now ?? (() => new Date());

  const sessionRepo = config.sessionRepo ?? createInMemorySessionRepository();
  const testInstanceRepo = createInMemoryTestInstanceRepository();

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
      sessionRepo
    })
  };
};

export type AssessmentModule = ReturnType<typeof configureAssessmentModule>;
