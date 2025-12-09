import { SessionRepository } from '../repository';
import { TestSession } from '../types/testSession';

type ListSessionsDeps = {
    sessionRepo: SessionRepository;
};

export const listSessions = (deps: ListSessionsDeps) => {
    return async (): Promise<TestSession[]> => {
        return await deps.sessionRepo.listAll();
    };
};
