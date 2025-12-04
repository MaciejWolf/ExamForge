import { Question } from "./types/question";
import { SupabaseClient } from "@supabase/supabase-js";

export type Document<T> = {
  id: string;
  created_at: string;
  updated_at: string;
  data: T;
};

export type QuestionRepository = {
  save: (question: Question) => Promise<Question>;
  findById: (id: string) => Promise<Question | null>;
  findAll: () => Promise<Question[]>;
  delete: (id: string) => Promise<boolean>;
  findByTags: (tags: string[]) => Promise<Question[]>;
};

const mapDocumentToQuestion = (doc: Document<Question>): Question => {
  return doc.data;
};

const mapQuestionToDocument = (question: Question): Omit<Document<Question>, 'created_at' | 'updated_at'> => {
  return {
    id: question.id,
    data: question,
  };
};

export const createSupabaseQuestionRepository = (supabase: SupabaseClient): QuestionRepository => {
  return {
    save: async (question: Question) => {
      const doc = mapQuestionToDocument(question);
      const createdAt = question.createdAt instanceof Date
        ? question.createdAt.toISOString()
        : question.createdAt;
      const updatedAt = question.updatedAt instanceof Date
        ? question.updatedAt.toISOString()
        : question.updatedAt;

      const { data, error } = await supabase
        .from('questions')
        .upsert({
          id: doc.id,
          created_at: createdAt,
          updated_at: updatedAt,
          data: doc.data,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving question:', error);
        throw new Error('Could not save question');
      }

      const questionDoc = data as Document<Question>;
      return mapDocumentToQuestion(questionDoc);
    },
    findById: async (id: string) => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error finding question by id:', error);
        throw new Error('Could not find question by id');
      }

      const questionDoc = data as Document<Question>;
      return mapDocumentToQuestion(questionDoc);
    },
    findAll: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error finding all questions:', error);
        throw new Error('Could not find all questions');
      }

      return (data as Document<Question>[]).map(mapDocumentToQuestion);
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting question:', error);
        return false;
      }
      return true;
    },
    findByTags: async (tags: string[]) => {
      if (tags.length === 0) {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error finding questions:', error);
          throw new Error('Could not find questions');
        }

        return (data as Document<Question>[]).map(mapDocumentToQuestion);
      }

      let query = supabase
        .from('questions')
        .select('*');

      tags.forEach(tag => {
        query = query.filter('data->tags', 'cs', `["${tag}"]`);
      });

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error finding questions by tags:', error);
        throw new Error('Could not find questions by tags');
      }

      return (data as Document<Question>[]).map(mapDocumentToQuestion);
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
