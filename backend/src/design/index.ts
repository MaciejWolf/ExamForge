import { v4 as uuidv4 } from 'uuid';
import * as useCases from './useCases';
import { createInMemoryQuestionRepository } from './repository';

export type DesignModuleConfig = {
    postgresConnectionString?: string;
    idGenerator?: () => string;
    now?: () => Date;
};

export const configureDesignModule = (config: DesignModuleConfig = {}) => {
    const repo = config.postgresConnectionString
        ? (() => { throw new Error('Postgres repository not implemented yet'); })()
        : createInMemoryQuestionRepository();

    const idGenerator = config.idGenerator ?? uuidv4;
    const now = config.now ?? (() => new Date());

    return {
        createQuestion: useCases.createQuestion({ repo, idGenerator, now }),
        updateQuestion: useCases.updateQuestion({ repo, now }),
        deleteQuestion: useCases.deleteQuestion({ repo }),
        getQuestion: useCases.getQuestion({ repo }),
    };
};

export type DesignModule = ReturnType<typeof configureDesignModule>;

export * from './types/testTemplate';
