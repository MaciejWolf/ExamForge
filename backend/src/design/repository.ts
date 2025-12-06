import { Question } from "./types/question";
import { SupabaseClient } from "@supabase/supabase-js";
import { TestTemplate } from "./types/testTemplate";

export type Document<T> = {
  id: string;
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

const mapQuestionToDocument = (question: Question): Document<Question> => {
  return {
    id: question.id,
    data: question,
  };
};

export const createSupabaseQuestionRepository = (supabase: SupabaseClient): QuestionRepository => {
  return {
    save: async (question: Question) => {
      const doc = mapQuestionToDocument(question);

      const { data, error } = await supabase
        .from('questions')
        .upsert(doc)
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

export type TemplateRepository = {
  save: (template: TestTemplate) => Promise<TestTemplate>;
  findById: (id: string) => Promise<TestTemplate | null>;
  findAll: () => Promise<TestTemplate[]>;
  findByName: (name: string) => Promise<TestTemplate | null>;
  findByQuestionId: (questionId: string) => Promise<TestTemplate[]>;
  delete: (id: string) => Promise<boolean>;
};

const mapDocumentToTemplate = (doc: Document<TestTemplate>): TestTemplate => {
  return doc.data;
};

const mapTemplateToDocument = (template: TestTemplate): Document<TestTemplate> => {
  return {
    id: template.id,
    data: template,
  };
};

export const createSupabaseTemplateRepository = (supabase: SupabaseClient): TemplateRepository => {
  return {
    save: async (template: TestTemplate) => {
      const doc = mapTemplateToDocument(template);

      const { data, error } = await supabase
        .from('templates')
        .upsert(doc)
        .select()
        .single();

      if (error) {
        console.error('Error saving template:', error);
        throw new Error('Could not save template');
      }

      const templateDoc = data as Document<TestTemplate>;
      return mapDocumentToTemplate(templateDoc);
    },
    findById: async (id: string) => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error finding template by id:', error);
        throw new Error('Could not find template by id');
      }

      const templateDoc = data as Document<TestTemplate>;
      return mapDocumentToTemplate(templateDoc);
    },
    findAll: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error finding all templates:', error);
        throw new Error('Could not find all templates');
      }

      return (data as Document<TestTemplate>[]).map(mapDocumentToTemplate);
    },
    findByName: async (name: string) => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('data->>name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error finding template by name:', error);
        throw new Error('Could not find template by name');
      }

      const templateDoc = data as Document<TestTemplate>;
      return mapDocumentToTemplate(templateDoc);
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting template:', error);
        return false;
      }
      return true;
    },
    findByQuestionId: async (questionId: string) => {
      // Note: This is a robust implementation fetching all templates.
      // Optimizing JSONB queries for deep nesting depends on specific Postgres indexes/extensions.
      const { data, error } = await supabase
        .from('templates')
        .select('*');

      if (error) {
        console.error('Error finding templates by question id:', error);
        throw new Error('Could not find templates by question id');
      }

      const allTemplates = (data as Document<TestTemplate>[]).map(mapDocumentToTemplate);
      return allTemplates.filter(t =>
        t.pools.some(p => p.questionIds.includes(questionId))
      );
    },
  };
};

export const createInMemoryTemplateRepository = () => {
  const templates = new Map<string, TestTemplate>();

  return {
    save: async (template: TestTemplate) => {
      templates.set(template.id, template);
      return template;
    },

    findById: async (id: string) => {
      return templates.get(id) || null;
    },

    findAll: async () => {
      return Array.from(templates.values());
    },

    findByName: async (name: string) => {
      const allTemplates = Array.from(templates.values());
      return allTemplates.find(t => t.name === name) || null;
    },

    delete: async (id: string) => {
      return templates.delete(id);
    },

    findByQuestionId: async (questionId: string) => {
      const allTemplates = Array.from(templates.values());
      return allTemplates.filter(t =>
        t.pools.some(p => p.questionIds.includes(questionId))
      );
    },
  };
};
