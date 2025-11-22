import { v4 as uuidv4 } from 'uuid';
import * as useCases from './useCases';
import { createInMemoryQuestionRepository, createSupabaseQuestionRepository, QuestionRepository } from './repository';
import { SupabaseClient } from '@supabase/supabase-js';

export type DesignModuleConfig = {
    supabaseClient?: SupabaseClient;
    idGenerator?: () => string;
    now?: () => Date;
};

export const configureDesignModule = (config: DesignModuleConfig = {}) => {
    const repo: QuestionRepository = config.supabaseClient
        ? createSupabaseQuestionRepository(config.supabaseClient)
        : createInMemoryQuestionRepository();

    const idGenerator = config.idGenerator ?? uuidv4;
    const now = config.now ?? (() => new Date());

    return {
        createQuestion: useCases.createQuestion({ repo, idGenerator, now }),
        updateQuestion: useCases.updateQuestion({ repo, now }),
        deleteQuestion: useCases.deleteQuestion({ repo }),
        getQuestion: useCases.getQuestion({ repo }),
        listQuestions: useCases.listQuestions({ repo }),
    };
};

export type DesignModule = ReturnType<typeof configureDesignModule>;

export * from './types/testTemplate';
