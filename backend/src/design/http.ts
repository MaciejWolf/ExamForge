import { Router, Request, Response } from 'express';
import { CreateQuestionCommand, UpdateQuestionCommand, CreateTemplateCommand, UpdateTemplateCommand } from './useCases';
import { DesignError } from './types/designError';
import { AuthenticatedRequest } from '../middleware/auth';

export const createDesignRouter = (): Router => {
  const router = Router();

  /**
   * @swagger
   * components:
   *   schemas:
   *     Answer:
   *       type: object
   *       required:
   *         - id
   *         - text
   *       properties:
   *         id:
   *           type: string
   *           description: Unique identifier for the answer
   *           example: "ans-1"
   *         text:
   *           type: string
   *           description: The answer text
   *           example: "Paris"
   *     Question:
   *       type: object
   *       required:
   *         - id
   *         - text
   *         - answers
   *         - correctAnswerId
   *         - tags
   *         - createdAt
   *         - updatedAt
   *       properties:
   *         id:
   *           type: string
   *           description: Unique identifier for the question
   *           example: "q-123"
   *         text:
   *           type: string
   *           description: The question text
   *           example: "What is the capital of France?"
   *         answers:
   *           type: array
   *           description: Array of possible answers (2-6 answers)
   *           minItems: 2
   *           maxItems: 6
   *           items:
   *             $ref: '#/components/schemas/Answer'
   *         correctAnswerId:
   *           type: string
   *           description: ID of the correct answer from the answers array
   *           example: "ans-1"
   *         tags:
   *           type: array
   *           description: Tags for categorizing the question (cannot contain '#')
   *           items:
   *             type: string
   *           example: ["geography", "europe"]
   *         createdAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the question was created
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           description: Timestamp when the question was last updated
   *     CreateQuestionRequest:
   *       type: object
   *       required:
   *         - text
   *         - answers
   *         - correctAnswerId
   *       properties:
   *         text:
   *           type: string
   *           description: The question text
   *           example: "What is the capital of France?"
   *         answers:
   *           type: array
   *           description: Array of possible answers (2-6 answers)
   *           minItems: 2
   *           maxItems: 6
   *           items:
   *             $ref: '#/components/schemas/Answer'
   *         correctAnswerId:
   *           type: string
   *           description: ID of the correct answer from the answers array
   *           example: "ans-1"
   *         tags:
   *           type: array
   *           description: Optional tags for categorizing the question
   *           items:
   *             type: string
   *           example: ["geography", "europe"]
   *     UpdateQuestionRequest:
   *       type: object
   *       properties:
   *         text:
   *           type: string
   *           description: The question text
   *           example: "What is the capital of France?"
   *         answers:
   *           type: array
   *           description: Array of possible answers (2-6 answers)
   *           items:
   *             $ref: '#/components/schemas/Answer'
   *         correctAnswerId:
   *           type: string
   *           description: ID of the correct answer from the answers array
   *           example: "ans-1"
   *         tags:
   *           type: array
   *           description: Tags for categorizing the question
   *           items:
   *             type: string
   *           example: ["geography", "europe"]
   *     Error:
   *       type: object
   *       properties:
   *         error:
   *           type: object
   *           properties:
   *             type:
   *               type: string
   *               description: Error type identifier
   *             message:
   *               type: string
   *               description: Human-readable error message
   *             questionId:
   *               type: string
   *               description: Question ID (for QuestionNotFound errors)
   */

  /**
   * @swagger
   * /api/design/questions:
   *   post:
   *     summary: Create a new question
   *     description: Creates a new question with answers and tags
   *     tags:
   *       - Questions
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateQuestionRequest'
   *           examples:
   *             basic:
   *               summary: Basic question
   *               value:
   *                 text: "What is the capital of France?"
   *                 answers:
   *                   - id: "ans-1"
   *                     text: "Paris"
   *                   - id: "ans-2"
   *                     text: "London"
   *                   - id: "ans-3"
   *                     text: "Berlin"
   *                 correctAnswerId: "ans-1"
   *                 tags: ["geography", "europe"]
   *     responses:
   *       201:
   *         description: Question created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Question'
   *       400:
   *         description: Invalid question data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             examples:
   *               missingText:
   *                 summary: Missing text
   *                 value:
   *                   error:
   *                     type: "InvalidQuestionData"
   *                     message: "Question text is required"
   *               invalidAnswers:
   *                 summary: Invalid answers
   *                 value:
   *                   error:
   *                     type: "InvalidQuestionData"
   *                     message: "Question must have at least 2 answers"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/questions', async (req: Request, res: Response) => {
    try {
      // Validate required fields
      if (req.body.text === undefined || req.body.text === null) {
        return res.status(400).json({
          error: {
            type: 'InvalidQuestionData',
            message: 'Question text is required',
          },
        });
      }

      if (!req.body.answers || !Array.isArray(req.body.answers)) {
        return res.status(400).json({
          error: {
            type: 'InvalidQuestionData',
            message: 'Question answers are required and must be an array',
          },
        });
      }

      if (!req.body.correctAnswerId) {
        return res.status(400).json({
          error: {
            type: 'InvalidQuestionData',
            message: 'correctAnswerId is required',
          },
        });
      }

      const command: CreateQuestionCommand = {
        text: req.body.text,
        answers: req.body.answers,
        correctAnswerId: req.body.correctAnswerId,
        tags: req.body.tags,
      };

      const result = await (req as AuthenticatedRequest).designModule.createQuestion(command);

      if (result.ok) {
        return res.status(201).json(result.value);
      }

      return handleError(result.error, res);
    } catch (error) {
      return res.status(500).json({
        error: {
          type: 'InternalServerError',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      });
    }
  });

  /**
   * @swagger
   * /api/design/questions/{id}:
   *   put:
   *     summary: Update an existing question
   *     description: Updates a question by ID with partial or full data
   *     tags:
   *       - Questions
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The question ID
   *         example: "q-123"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateQuestionRequest'
   *           examples:
   *             updateText:
   *               summary: Update text only
   *               value:
   *                 text: "What is the capital city of France?"
   *             updateTags:
   *               summary: Update tags only
   *               value:
   *                 tags: ["geography", "europe", "capitals"]
   *             fullUpdate:
   *               summary: Update all fields
   *               value:
   *                 text: "What is the capital of France?"
   *                 answers:
   *                   - id: "ans-1"
   *                     text: "Paris"
   *                   - id: "ans-2"
   *                     text: "London"
   *                 correctAnswerId: "ans-1"
   *                 tags: ["geography"]
   *     responses:
   *       200:
   *         description: Question updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Question'
   *       400:
   *         description: Invalid question data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Question not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error:
   *                 type: "QuestionNotFound"
   *                 questionId: "q-123"
   */
  router.put('/questions/:id', async (req: Request, res: Response) => {
    const command: UpdateQuestionCommand = {
      id: req.params.id,
      text: req.body.text,
      answers: req.body.answers,
      correctAnswerId: req.body.correctAnswerId,
      tags: req.body.tags,
    };

    const result = await (req as AuthenticatedRequest).designModule.updateQuestion(command);

    if (result.ok) {
      return res.status(200).json(result.value);
    }

    return handleError(result.error, res);
  });

  /**
   * @swagger
   * /api/design/questions:
   *   get:
   *     summary: List all questions
   *     description: Retrieves a list of questions, optionally filtered by tags
   *     tags:
   *       - Questions
   *     parameters:
   *       - in: query
   *         name: tags
   *         schema:
   *           oneOf:
   *             - type: string
   *             - type: array
   *               items:
   *                 type: string
   *         description: Filter questions by tags (can be a single tag or array of tags)
   *         examples:
   *           single:
   *             summary: Single tag
   *             value: "geography"
   *           multiple:
   *             summary: Multiple tags
   *             value: ["geography", "europe"]
   *     responses:
   *       200:
   *         description: List of questions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Question'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/questions', async (req: Request, res: Response) => {
    try {
      const tags = req.query.tags;
      const tagArray = tags
        ? (Array.isArray(tags) ? tags : [tags]).map(t => String(t))
        : undefined;

      const result = await (req as AuthenticatedRequest).designModule.listQuestions({ tags: tagArray });

      if (result.ok) {
        return res.status(200).json(result.value);
      }

      return handleError(result.error, res);
    } catch (error) {
      return res.status(500).json({
        error: {
          type: 'InternalServerError',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      });
    }
  });

  /**
   * @swagger
   * /api/design/questions/{id}:
   *   get:
   *     summary: Get a question by ID
   *     description: Retrieves a single question by its unique identifier
   *     tags:
   *       - Questions
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The question ID
   *         example: "q-123"
   *     responses:
   *       200:
   *         description: Question retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Question'
   *       404:
   *         description: Question not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error:
   *                 type: "QuestionNotFound"
   *                 questionId: "q-123"
   */
  router.get('/questions/:id', async (req: Request, res: Response) => {
    const result = await (req as AuthenticatedRequest).designModule.getQuestion(req.params.id);

    if (result.ok) {
      return res.status(200).json(result.value);
    }

    return handleError(result.error, res);
  });

  /**
   * @swagger
   * /api/design/questions/{id}:
   *   delete:
   *     summary: Delete a question
   *     description: Deletes a question by its unique identifier
   *     tags:
   *       - Questions
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The question ID
   *         example: "q-123"
   *     responses:
   *       200:
   *         description: Question deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Question deleted successfully"
   *       404:
   *         description: Question not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error:
   *                 type: "QuestionNotFound"
   *                 questionId: "q-123"
   */
  router.delete('/questions/:id', async (req: Request, res: Response) => {
    const result = await (req as AuthenticatedRequest).designModule.deleteQuestion(req.params.id);

    if (result.ok) {
      return res.status(200).json({ message: 'Question deleted successfully' });
    }

    return handleError(result.error, res);
  });

  /**
   * @swagger
   * /api/design/templates:
   *   post:
   *     summary: Create a new test template
   *     description: Creates a new test template with pools referencing global questions
   *     tags:
   *       - Templates
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - pools
   *             properties:
   *               name:
   *                 type: string
   *                 description: Template name
   *               description:
   *                 type: string
   *                 description: Optional template description
   *               pools:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - name
   *                     - questionCount
   *                     - points
   *                     - questionIds
   *                   properties:
   *                     name:
   *                       type: string
   *                     questionCount:
   *                       type: number
   *                     points:
   *                       type: number
   *                     questionIds:
   *                       type: array
   *                       items:
   *                         type: string
   *     responses:
   *       201:
   *         description: Template created successfully
   *       400:
   *         description: Invalid template data
   */
  router.post('/templates', async (req: Request, res: Response) => {
    try {
      const command: CreateTemplateCommand = {
        name: req.body.name,
        description: req.body.description,
        pools: req.body.pools,
      };

      const result = await (req as AuthenticatedRequest).designModule.createTemplate(command);

      if (result.ok) {
        return res.status(201).json(result.value);
      }

      return handleError(result.error, res);
    } catch (error) {
      return res.status(500).json({
        error: {
          type: 'InternalServerError',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      });
    }
  });

  /**
   * @swagger
   * /api/design/templates/{id}:
   *   get:
   *     summary: Get a template by ID
   *     description: Retrieves a test template with its pools and question references
   *     tags:
   *       - Templates
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Template retrieved successfully
   *       404:
   *         description: Template not found
   */
  router.get('/templates/:id', async (req: Request, res: Response) => {
    const result = await (req as AuthenticatedRequest).designModule.getTemplate(req.params.id);

    if (result.ok) {
      return res.status(200).json(result.value);
    }

    return handleError(result.error, res);
  });

  /**
   * @swagger
   * /api/design/templates/{id}:
   *   put:
   *     summary: Update an existing template
   *     description: Updates a template's metadata, pools, or question assignments
   *     tags:
   *       - Templates
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               pools:
   *                 type: array
   *                 items:
   *                   type: object
   *     responses:
   *       200:
   *         description: Template updated successfully
   *       400:
   *         description: Invalid template data
   *       404:
   *         description: Template not found
   */
  router.put('/templates/:id', async (req: Request, res: Response) => {
    const command: UpdateTemplateCommand = {
      id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      pools: req.body.pools,
    };

    const result = await (req as AuthenticatedRequest).designModule.updateTemplate(command);

    if (result.ok) {
      return res.status(200).json(result.value);
    }

    return handleError(result.error, res);
  });

  /**
   * @swagger
   * /api/design/templates/{id}:
   *   delete:
   *     summary: Delete a template
   *     description: Deletes a test template by its ID
   *     tags:
   *       - Templates
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Template deleted successfully
   *       404:
   *         description: Template not found
   */
  router.delete('/templates/:id', async (req: Request, res: Response) => {
    const result = await (req as AuthenticatedRequest).designModule.deleteTemplate(req.params.id);

    if (result.ok) {
      return res.status(200).json({ message: 'Template deleted successfully' });
    }

    return handleError(result.error, res);
  });

  /**
   * @swagger
   * /api/design/templates:
   *   get:
   *     summary: List all templates
   *     description: Retrieves a list of all test templates
   *     tags:
   *       - Templates
   *     responses:
   *       200:
   *         description: List of templates retrieved successfully
   */
  router.get('/templates', async (req: Request, res: Response) => {
    const result = await (req as AuthenticatedRequest).designModule.listTemplates();

    if (result.ok) {
      return res.status(200).json(result.value);
    }

    return handleError(result.error, res);
  });

  return router;
};

const handleError = (error: DesignError, res: Response): Response => {
  switch (error.type) {
    case 'InvalidQuestionData':
      return res.status(400).json({
        error: {
          type: error.type,
          message: error.message,
        },
      });
    case 'QuestionNotFound':
      return res.status(404).json({
        error: {
          type: error.type,
          questionId: error.questionId,
        },
      });
    case 'QuestionInUse':
      return res.status(409).json({
        error: {
          type: error.type,
          questionId: error.questionId,
          templateIds: error.templateIds,
        },
      });
    case 'TemplateNotFound':
      return res.status(404).json({
        error: {
          type: error.type,
          templateId: error.templateId,
        },
      });
    case 'TemplateNameConflict':
      return res.status(409).json({
        error: {
          type: error.type,
          name: error.name,
        },
      });
    case 'PoolNotFound':
      return res.status(404).json({
        error: {
          type: error.type,
          poolId: error.poolId,
        },
      });
    case 'PoolNameConflict':
      return res.status(409).json({
        error: {
          type: error.type,
          name: error.name,
        },
      });
    case 'DuplicatePoolNames':
      return res.status(400).json({
        error: {
          type: error.type,
          names: error.names,
        },
      });
    case 'QuestionAlreadyInPool':
      return res.status(409).json({
        error: {
          type: error.type,
          questionId: error.questionId,
          poolId: error.poolId,
        },
      });
    case 'QuestionNotInPool':
      return res.status(404).json({
        error: {
          type: error.type,
          questionId: error.questionId,
          poolId: error.poolId,
        },
      });
    case 'InvalidPoolReferences':
      return res.status(400).json({
        error: {
          type: error.type,
          message: error.message,
        },
      });
    case 'InsufficientQuestions':
      return res.status(400).json({
        error: {
          type: error.type,
          poolId: error.poolId,
          required: error.required,
          available: error.available,
        },
      });
    default:
      return res.status(500).json({
        error: {
          type: 'InternalServerError',
          message: 'An unexpected error occurred',
        },
      });
  }
};

