import { SessionRepository, TestInstanceRepository } from '../repository';
import { TestSession } from '../types/testSession';

export type TemplateProvider = {
    getTemplateNames: (templateIds: string[]) => Promise<Map<string, string>>;
};

export type TestSessionSummary = TestSession & {
    templateName: string;
    participantCount: number;
};

type ListSessionsDeps = {
    sessionRepo: SessionRepository;
    testInstanceRepo: TestInstanceRepository;
    templateProvider: TemplateProvider;
};

export const listSessions = (deps: ListSessionsDeps) => {
    return async (): Promise<TestSessionSummary[]> => {
        const sessions = await deps.sessionRepo.listAll();

        if (sessions.length === 0) {
            return [];
        }

        const sessionIds = sessions.map(s => s.id);
        const templateIds = Array.from(new Set(sessions.map(s => s.templateId)));

        const [participantCounts, templateNames] = await Promise.all([
            deps.testInstanceRepo.getParticipantCounts(sessionIds),
            deps.templateProvider.getTemplateNames(templateIds)
        ]);

        return sessions.map(session => ({
            ...session,
            templateName: templateNames.get(session.templateId) || 'Unknown Template',
            participantCount: participantCounts.get(session.id) || 0
        }));
    };
};
