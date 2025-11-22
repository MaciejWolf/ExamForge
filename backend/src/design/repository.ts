import { Question } from "./types/question";
import { SupabaseClient } from "@supabase/supabase-js";

export type QuestionRepository = {
    save: (question: Question) => Promise<Question>;
    findById: (id: string) => Promise<Question | null>;
    findAll: () => Promise<Question[]>;
    delete: (id: string) => Promise<boolean>;
    findByTags: (tags: string[]) => Promise<Question[]>;
};

export const createSupabaseQuestionRepository = (supabase: SupabaseClient): QuestionRepository => {
    return {
        save: async (question: Question) => {
            const { data, error } = await supabase
                .from('questions')
                .upsert(question)
                .select()
                .single();

            if (error) {
                console.error('Error saving question:', error);
                throw new Error('Could not save question');
            }
            return data as Question;
        },
        findById: async (id: string) => {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // "Not a single row was returned"
                    return null;
                }
                console.error('Error finding question by id:', error);
                throw new Error('Could not find question by id');
            }

            return data as Question;
        },
        findAll: async () => {
            const { data, error } = await supabase.from('questions').select('*');
            if (error) {
                console.error('Error finding all questions:', error);
                throw new Error('Could not find all questions');
            }
            return data as Question[];
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('questions').delete().eq('id', id);
            if (error) {
                console.error('Error deleting question:', error);
                return false;
            }
            return true;
        },
        findByTags: async (tags: string[]) => {
            if (tags.length === 0) {
                return await (await supabase.from('questions').select('*')).data as Question[] || [];
            }
            const { data, error } = await supabase.from('questions').select('*').contains('tags', tags);
            if (error) {
                console.error('Error finding questions by tags:', error);
                throw new Error('Could not find questions by tags');
            }
            return data as Question[];
        }
    };
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
        tags.every(tagName => question.tags.some(tag => tag === tagName))
      );
    },
  };
};
