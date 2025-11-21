import { Question } from './domain';

export type TemplateRepository = {
  // To be implemented later
};

export const createInMemoryQuestionRepository = () => {
  const questions = new Map<string, Question>();

  return {
    save: async (question: Question) => {
      questions.set(question.id, question);
      return question;
    },

    findById: async (id: string) => {
      return questions.get(id) || null;
    },

    findAll: async () => {
      return Array.from(questions.values());
    },

    delete: async (id: string) => {
      return questions.delete(id);
    },

    findByTags: async (tags: string[]) => {
      const allQuestions = Array.from(questions.values());

      if (tags.length === 0) {
        return allQuestions;
      }

      return allQuestions.filter(question =>
        tags.every(tagName => question.tags.some(tag => tag.name === tagName || tag.id === tagName))
      );
    },
  };
};

export type QuestionRepository = ReturnType<typeof createInMemoryQuestionRepository>;