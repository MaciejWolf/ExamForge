import { err, ok, Result } from '../shared/result';
import { Question } from './types/question';
import { DesignError } from './types/designError';
import { Answer } from './types/question';
import { QuestionRepository, TemplateRepository } from './repository';
import { TestTemplate, Pool } from './types/testTemplate';
import { TestContentPackage, MaterializedSection } from './types/testContentPackage';

type CreateQuestionDeps = {
  repo: QuestionRepository;
  idGenerator: () => string;
  now: () => Date;
};

export type CreateQuestionCommand = {
  text: string;
  answers: Answer[];
  correctAnswerId: string;
  tags?: string[];
};

type ValidationResult = {
  valid: boolean;
  message: string;
};

export const createQuestion = ({ repo, idGenerator, now }: CreateQuestionDeps) => {
  return async (cmd: CreateQuestionCommand): Promise<Result<Question, DesignError>> => {
    const validation = validateQuestionInput(cmd);
    if (!validation.valid) {
      return err({
        type: 'InvalidQuestionData',
        message: validation.message,
      });
    }

    const timestamp = now();
    const question: Question = {
      id: idGenerator(),
      text: cmd.text,
      answers: cmd.answers,
      correctAnswerId: cmd.correctAnswerId,
      tags: cmd.tags || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const savedQuestion = await repo.save(question);

    return ok(savedQuestion);
  };
};

const validateQuestionInput = (input: CreateQuestionCommand): ValidationResult => {
  if (input.answers.length < 2) {
    return {
      valid: false,
      message: 'Question must have at least 2 answers',
    };
  }

  if (input.answers.length > 6) {
    return {
      valid: false,
      message: 'Question cannot have more than 6 answers',
    };
  }

  const correctAnswerExists = input.answers.some(answer => answer.id === input.correctAnswerId);
  if (!correctAnswerExists) {
    return {
      valid: false,
      message: 'correctAnswerId must be a valid answer ID in the answers array',
    };
  }

  if (!input.text || input.text.trim().length === 0) {
    return {
      valid: false,
      message: 'Question text cannot be empty',
    };
  }

  if (input.tags && input.tags.length > 0) {
    const tagValidation = validateTags(input.tags);
    if (!tagValidation.valid) {
      return tagValidation;
    }
  }

  return { valid: true, message: '' };
};

const validateTags = (tags: string[]): ValidationResult => {
  const invalidTag = tags.find(tag => tag.includes('#'));
  if (invalidTag) {
    return {
      valid: false,
      message: 'Tags cannot contain the "#" character',
    };
  }
  return { valid: true, message: '' };
};

type UpdateQuestionDeps = {
  repo: QuestionRepository;
  now: () => Date;
};

export type UpdateQuestionCommand = {
  id: string;
  text?: string;
  answers?: Answer[];
  correctAnswerId?: string;
  tags?: string[];
};

export const updateQuestion = ({ repo, now }: UpdateQuestionDeps) => {
  return async (cmd: UpdateQuestionCommand): Promise<Result<Question, DesignError>> => {
    // Check if question exists
    const existing = await repo.findById(cmd.id);
    if (!existing) {
      return err({
        type: 'QuestionNotFound',
        questionId: cmd.id,
      });
    }

    // Validate tags if provided
    if (cmd.tags !== undefined) {
      const tagValidation = validateTags(cmd.tags);
      if (!tagValidation.valid) {
        return err({
          type: 'InvalidQuestionData',
          message: tagValidation.message,
        });
      }
    }

    // Build updated question with partial updates
    const updatedQuestion: Question = {
      ...existing,
      text: cmd.text !== undefined ? cmd.text : existing.text,
      answers: cmd.answers !== undefined ? cmd.answers : existing.answers,
      correctAnswerId: cmd.correctAnswerId !== undefined ? cmd.correctAnswerId : existing.correctAnswerId,
      tags: cmd.tags !== undefined ? cmd.tags : existing.tags,
      updatedAt: now(),
    };

    // Validate the updated question
    const validation = validateQuestionInput({
      text: updatedQuestion.text,
      answers: updatedQuestion.answers,
      correctAnswerId: updatedQuestion.correctAnswerId,
      tags: updatedQuestion.tags,
    });
    if (!validation.valid) {
      return err({
        type: 'InvalidQuestionData',
        message: validation.message,
      });
    }

    const savedQuestion = await repo.save(updatedQuestion);

    return ok(savedQuestion);
  };
};

type DeleteQuestionDeps = {
  repo: QuestionRepository;
  templateRepo: TemplateRepository;
};

export const deleteQuestion = ({ repo, templateRepo }: DeleteQuestionDeps) => {
  return async (id: string): Promise<Result<void, DesignError>> => {
    const existing = await repo.findById(id);
    if (!existing) {
      return err({
        type: 'QuestionNotFound',
        questionId: id,
      });
    }

    const templatesUsingQuestion = await templateRepo.findByQuestionId(id);
    if (templatesUsingQuestion.length > 0) {
      return err({
        type: 'QuestionInUse',
        questionId: id,
        templateIds: templatesUsingQuestion.map(t => t.id),
      });
    }

    await repo.delete(id);

    return ok(undefined);
  };
};

type GetQuestionDeps = {
  repo: QuestionRepository;
};

export const getQuestion = ({ repo }: GetQuestionDeps) => {
  return async (id: string): Promise<Result<Question, DesignError>> => {
    const question = await repo.findById(id);
    if (!question) {
      return err({
        type: 'QuestionNotFound',
        questionId: id,
      });
    }

    return ok(question);
  };
};

type ListQuestionsDeps = {
  repo: QuestionRepository;
};

export type ListQuestionsCommand = {
  tags?: string[];
};

export const listQuestions = ({ repo }: ListQuestionsDeps) => {
  return async (cmd: ListQuestionsCommand = {}): Promise<Result<Question[], DesignError>> => {
    const tags = cmd.tags || [];
    const questions = await repo.findByTags(tags);
    return ok(questions);
  };
};

type CreateTemplateDeps = {
  templateRepo: TemplateRepository;
  questionRepo: QuestionRepository;
  idGenerator: () => string;
  now: () => Date;
};

export type CreateTemplateCommand = {
  name: string;
  description?: string;
  pools: Omit<Pool, 'id'>[];
};

export const createTemplate = ({ templateRepo, questionRepo, idGenerator, now }: CreateTemplateDeps) => {
  return async (cmd: CreateTemplateCommand): Promise<Result<TestTemplate, DesignError>> => {
    // Validate template name
    if (!cmd.name || cmd.name.trim().length === 0) {
      return err({
        type: 'InvalidQuestionData',
        message: 'Template name is required',
      });
    }

    // Check for name conflict
    const existingTemplate = await templateRepo.findByName(cmd.name);
    if (existingTemplate) {
      return err({
        type: 'TemplateNameConflict',
        name: cmd.name,
      });
    }

    // Validate pools
    const poolValidation = await validatePools(cmd.pools);
    if (!poolValidation.valid) {
      return err({
        type: poolValidation.errorType || 'InvalidQuestionData',
        message: poolValidation.message,
      } as DesignError);
    }

    // Verify all question IDs exist
    const allQuestionIds = cmd.pools.flatMap(pool => pool.questionIds);
    const uniqueQuestionIds = [...new Set(allQuestionIds)];

    for (const questionId of uniqueQuestionIds) {
      const question = await questionRepo.findById(questionId);
      if (!question) {
        return err({
          type: 'InvalidQuestionData',
          message: `Question with ID ${questionId} not found`,
        });
      }
    }

    // Generate IDs for pools
    const poolsWithIds: Pool[] = cmd.pools.map(pool => ({
      ...pool,
      id: idGenerator(),
    }));

    const timestamp = now();
    const template: TestTemplate = {
      id: idGenerator(),
      name: cmd.name.trim(),
      description: cmd.description,
      pools: poolsWithIds,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const savedTemplate = await templateRepo.save(template);

    return ok(savedTemplate);
  };
};

type UpdateTemplateDeps = {
  templateRepo: TemplateRepository;
  questionRepo: QuestionRepository;
  idGenerator: () => string;
  now: () => Date;
};

export type UpdateTemplateCommand = {
  id: string;
  name?: string;
  description?: string;
  pools?: Omit<Pool, 'id'>[];
};

export const updateTemplate = ({ templateRepo, questionRepo, idGenerator, now }: UpdateTemplateDeps) => {
  return async (cmd: UpdateTemplateCommand): Promise<Result<TestTemplate, DesignError>> => {
    // Check if template exists
    const existing = await templateRepo.findById(cmd.id);
    if (!existing) {
      return err({
        type: 'TemplateNotFound',
        templateId: cmd.id,
      });
    }

    // If name is being updated, check for conflicts
    if (cmd.name !== undefined) {
      if (!cmd.name || cmd.name.trim().length === 0) {
        return err({
          type: 'InvalidQuestionData',
          message: 'Template name cannot be empty',
        });
      }

      const existingWithName = await templateRepo.findByName(cmd.name.trim());
      if (existingWithName && existingWithName.id !== cmd.id) {
        return err({
          type: 'TemplateNameConflict',
          name: cmd.name.trim(),
        });
      }
    }

    // If pools are being updated, validate them
    if (cmd.pools !== undefined) {
      const poolValidation = await validatePools(cmd.pools);
      if (!poolValidation.valid) {
        return err({
          type: poolValidation.errorType || 'InvalidQuestionData',
          message: poolValidation.message,
        } as DesignError);
      }

      // Verify all question IDs exist
      const allQuestionIds = cmd.pools.flatMap(pool => pool.questionIds);
      const uniqueQuestionIds = [...new Set(allQuestionIds)];

      for (const questionId of uniqueQuestionIds) {
        const question = await questionRepo.findById(questionId);
        if (!question) {
          return err({
            type: 'InvalidQuestionData',
            message: `Question with ID ${questionId} not found`,
          });
        }
      }
    }

    // Build updated template (monolithic update - replace entire state)
    // When pools are updated, preserve IDs where pool names match, otherwise generate new IDs
    let updatedPools: Pool[] = existing.pools;

    if (cmd.pools !== undefined) {
      updatedPools = cmd.pools.map(pool => {
        const existingPool = existing.pools.find(p => p.name === pool.name);
        return {
          ...pool,
          id: existingPool?.id || idGenerator(), // Preserve ID if name matches, otherwise generate new ID
        };
      });
    }

    const updatedTemplate: TestTemplate = {
      ...existing,
      name: cmd.name !== undefined ? cmd.name.trim() : existing.name,
      description: cmd.description !== undefined ? cmd.description : existing.description,
      pools: updatedPools,
      updatedAt: now(),
    };

    const savedTemplate = await templateRepo.save(updatedTemplate);

    return ok(savedTemplate);
  };
};

type PoolValidationResult = {
  valid: boolean;
  message: string;
  errorType?: DesignError['type'];
};

type DeleteTemplateDeps = {
  templateRepo: TemplateRepository;
};

export const deleteTemplate = ({ templateRepo }: DeleteTemplateDeps) => {
  return async (id: string): Promise<Result<void, DesignError>> => {
    const existing = await templateRepo.findById(id);
    if (!existing) {
      return err({
        type: 'TemplateNotFound',
        templateId: id,
      });
    }

    await templateRepo.delete(id);

    return ok(undefined);
  };
};

const validatePools = async (pools: Omit<Pool, 'id'>[]): Promise<PoolValidationResult> => {
  if (pools.length === 0) {
    return {
      valid: false,
      message: 'Template must have at least one pool',
    };
  }

  // Check for duplicate pool names
  const poolNames = pools.map(p => p.name);
  const duplicateNames = poolNames.filter((name, index) => poolNames.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    return {
      valid: false,
      message: `Duplicate pool names found: ${duplicateNames.join(', ')}`,
      errorType: 'DuplicatePoolNames',
    };
  }

  // Validate each pool
  for (const pool of pools) {
    if (!pool.name || pool.name.trim().length === 0) {
      return {
        valid: false,
        message: 'Pool name is required',
      };
    }

    if (pool.questionsToDraw < 0) {
      return {
        valid: false,
        message: `Pool "${pool.name}" cannot have negative question count`,
      };
    }

    if (pool.points < 0) {
      return {
        valid: false,
        message: `Pool "${pool.name}" cannot have negative points`,
      };
    }

    // Note: We don't validate if pool has sufficient questions here
    // This validation happens at materialization time to allow flexibility
    // in template creation and editing
  }

  return { valid: true, message: '' };
};

type GetTemplateDeps = {
  templateRepo: TemplateRepository;
};

export const getTemplate = ({ templateRepo }: GetTemplateDeps) => {
  return async (id: string): Promise<Result<TestTemplate, DesignError>> => {
    const template = await templateRepo.findById(id);
    if (!template) {
      return err({
        type: 'TemplateNotFound',
        templateId: id,
      });
    }

    return ok(template);
  };
};

type ListTemplatesDeps = {
  templateRepo: TemplateRepository;
};

export const listTemplates = ({ templateRepo }: ListTemplatesDeps) => {
  return async (): Promise<Result<TestTemplate[], DesignError>> => {
    const templates = await templateRepo.findAll();
    return ok(templates);
  };
};

type MaterializeTemplateDeps = {
  templateRepo: TemplateRepository;
  questionRepo: QuestionRepository;
  idGenerator: () => string;
  now: () => Date;
  randomSelector?: <T>(items: T[], count: number) => T[];
  answerShuffler?: <T>(items: T[]) => T[];
};

export const materializeTemplate = ({
  templateRepo,
  questionRepo,
  idGenerator,
  now,
  randomSelector = defaultRandomSelector,
  answerShuffler = defaultShuffler
}: MaterializeTemplateDeps) => {
  return async (templateId: string): Promise<Result<TestContentPackage, DesignError>> => {
    // Check if template exists
    const template = await templateRepo.findById(templateId);
    if (!template) {
      return err({
        type: 'TemplateNotFound',
        templateId,
      });
    }

    // Validate and materialize each pool
    const sections: MaterializedSection[] = [];

    for (const pool of template.pools) {
      // Check if pool has sufficient questions
      const available = pool.questionIds.length;
      const required = pool.questionsToDraw;

      if (available < required) {
        return err({
          type: 'InsufficientQuestions',
          poolId: pool.id,
          required,
          available,
        });
      }

      // Fetch all questions in the pool
      const poolQuestions: Question[] = [];
      for (const questionId of pool.questionIds) {
        const question = await questionRepo.findById(questionId);
        if (question) {
          poolQuestions.push(question);
        }
      }

      // Select random questions from the pool
      const selectedQuestions = randomSelector(poolQuestions, pool.questionsToDraw);

      // Create frozen snapshots of selected questions with answer selection and shuffling
      const frozenQuestions = selectedQuestions.map(q =>
        createQuestionSnapshot(q, randomSelector, answerShuffler)
      );

      // Create materialized section
      sections.push({
        poolId: pool.id,
        poolName: pool.name,
        points: pool.points,
        questions: frozenQuestions,
      });
    }

    // Create the test content package
    const contentPackage: TestContentPackage = {
      id: idGenerator(),
      templateId: template.id,
      sections,
      createdAt: now(),
    };

    return ok(contentPackage);
  };
};

// Helper function to create a deep copy/snapshot of a question with answer selection and shuffling
const createQuestionSnapshot = (
  question: Question,
  randomSelector: <T>(items: T[], count: number) => T[],
  answerShuffler: <T>(items: T[]) => T[]
): Question => {
  const selectedAnswers = selectAndShuffleAnswers(
    question.answers,
    question.correctAnswerId,
    randomSelector,
    answerShuffler
  );

  return {
    ...question,
    answers: selectedAnswers,
    tags: [...question.tags],
    createdAt: new Date(question.createdAt),
    updatedAt: new Date(question.updatedAt),
  };
};

// Helper function to select and shuffle answers
// Rules:
// - If question has <= 4 answers: select all and shuffle
// - If question has > 4 answers: select 1 correct + 3 random incorrect, then shuffle
const selectAndShuffleAnswers = (
  answers: Answer[],
  correctAnswerId: string,
  randomSelector: <T>(items: T[], count: number) => T[],
  answerShuffler: <T>(items: T[]) => T[]
): Answer[] => {
  // If 4 or fewer answers, return all of them shuffled
  if (answers.length <= 4) {
    const copiedAnswers = answers.map(a => ({ ...a }));
    return answerShuffler(copiedAnswers);
  }

  // If more than 4 answers, select 1 correct + 3 incorrect
  const correctAnswer = answers.find(a => a.id === correctAnswerId);
  const incorrectAnswers = answers.filter(a => a.id !== correctAnswerId);

  if (!correctAnswer) {
    // Fallback: if correct answer not found, just take first 4 and shuffle
    const copiedAnswers = answers.slice(0, 4).map(a => ({ ...a }));
    return answerShuffler(copiedAnswers);
  }

  // Select 3 random incorrect answers
  const selectedIncorrect = randomSelector(incorrectAnswers, Math.min(3, incorrectAnswers.length));

  // Combine correct + selected incorrect, make deep copies, and shuffle
  const selectedAnswers = [correctAnswer, ...selectedIncorrect].map(a => ({ ...a }));
  return answerShuffler(selectedAnswers);
};

// Default random selector using Fisher-Yates shuffle algorithm
const defaultRandomSelector = <T>(items: T[], count: number): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

// Default shuffler using Fisher-Yates shuffle algorithm
const defaultShuffler = <T>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
