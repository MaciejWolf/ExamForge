import { Router, Request, Response } from 'express';
import { DesignModule } from './index';
import { CreateQuestionCommand, UpdateQuestionCommand } from './useCases';
import { DesignError } from './types/designError';

export const createDesignRouter = (module: DesignModule): Router => {
  const router = Router();

  // POST /questions
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

      const result = await module.createQuestion(command);

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

  // PUT /questions/:id
  router.put('/questions/:id', async (req: Request, res: Response) => {
    const command: UpdateQuestionCommand = {
      id: req.params.id,
      text: req.body.text,
      answers: req.body.answers,
      correctAnswerId: req.body.correctAnswerId,
      tags: req.body.tags,
    };

    const result = await module.updateQuestion(command);

    if (result.ok) {
      return res.status(200).json(result.value);
    }

    return handleError(result.error, res);
  });

  // GET /questions
  router.get('/questions', async (req: Request, res: Response) => {
    try {
      const tags = req.query.tags;
      const tagArray = tags
        ? (Array.isArray(tags) ? tags : [tags]).map(t => String(t))
        : undefined;

      const result = await module.listQuestions({ tags: tagArray });

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

  // GET /questions/:id
  router.get('/questions/:id', async (req: Request, res: Response) => {
    const result = await module.getQuestion(req.params.id);

    if (result.ok) {
      return res.status(200).json(result.value);
    }

    return handleError(result.error, res);
  });

  // DELETE /questions/:id
  router.delete('/questions/:id', async (req: Request, res: Response) => {
    const result = await module.deleteQuestion(req.params.id);

    if (result.ok) {
      return res.status(200).json({ message: 'Question deleted successfully' });
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
    default:
      return res.status(500).json({
        error: {
          type: 'InternalServerError',
          message: 'An unexpected error occurred',
        },
      });
  }
};

