import { Question } from './domain';

export type QuestionRepository = {
    save: (question: Question) => Promise<Question>;
    findById: (id: string) => Promise<Question | null>;
    findAll: () => Promise<Question[]>;
    delete: (id: string) => Promise<boolean>;
    findByTags: (tags: string[]) => Promise<Question[]>;
};

export type TemplateRepository = {
    // To be implemented later
};

export const createInMemoryQuestionRepository = (): QuestionRepository => {
    const questions = new Map<string, Question>();

    return {
        save: async (question) => {
            questions.set(question.id, question);
            return question;
        },

        findById: async (id) => {
            return questions.get(id) || null;
        },

        findAll: async () => {
            return Array.from(questions.values());
        },

        delete: async (id) => {
            return questions.delete(id);
        },

        findByTags: async (tags) => {
            const allQuestions = Array.from(questions.values());

            if (tags.length === 0) {
                return allQuestions;
            }

            return allQuestions.filter(question =>
                tags.every(tag => question.tags.includes(tag))
            );
        },
    };
};
