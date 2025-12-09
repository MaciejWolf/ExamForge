import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';
import * as useCases from './useCases';
import { SessionRepository, createInMemorySessionRepository } from './repository';
import { Result } from '../shared/result';
import { TestContentPackage } from '../design/types/testContentPackage';
import { DesignError } from '../design/types/designError';

type MaterializeTemplateFn = (templateId: string) => Promise<Result<TestContentPackage, DesignError>>;

export type AssessmentModuleConfig = {
  supabaseClient?: SupabaseClient;
  idGenerator?: () => string;
  now?: () => Date;
  materializeTemplate: MaterializeTemplateFn;
  sessionRepo?: SessionRepository;
};

export const configureAssessmentModule = (config: AssessmentModuleConfig) => {
  const idGenerator = config.idGenerator ?? uuidv4;
  const now = config.now ?? (() => new Date());

  const sessionRepo = config.sessionRepo ?? createInMemorySessionRepository();

  return {
    startSession: useCases.startSession({
      sessionRepo,
      materializeTemplate: config.materializeTemplate,
      idGenerator,
      now
    })
  };
};

export type AssessmentModule = ReturnType<typeof configureAssessmentModule>;
