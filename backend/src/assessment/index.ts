import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';

export type AssessmentModuleConfig = {
  supabaseClient?: SupabaseClient;
  idGenerator?: () => string;
  now?: () => Date;
};

export const configureAssessmentModule = (config: AssessmentModuleConfig = {}) => {
  const idGenerator = config.idGenerator ?? uuidv4;
  const now = config.now ?? (() => new Date());

  return {
    // Use cases will be added here as the module develops
  };
};

export type AssessmentModule = ReturnType<typeof configureAssessmentModule>;
