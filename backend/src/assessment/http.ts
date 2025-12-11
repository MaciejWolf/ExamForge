import { Router, Request, Response } from 'express';
import { AssessmentModule } from './index';
import { AssessmentError } from './types/assessmentError';
import { ParticipantTestContent, ParticipantQuestion } from './types/participantQuestion';
import { Question } from '../design/types/question';
import { TestInstance } from './types/testInstance';

type StartSessionRequestBody = {
  templateId: string;
  examinerId: string;
  timeLimitMinutes: number;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  participantIdentifiers: string[];
};

type StartTestInstanceRequestBody = {
  accessCode: string;
};

type ParticipantTestInstance = Omit<TestInstance, 'testContent'> & {
  testContent: ParticipantTestContent;
};

const sanitizeQuestion = (question: Question): ParticipantQuestion => {
  const { correctAnswerId, ...sanitized } = question;
  return sanitized as ParticipantQuestion;
};

const toParticipantTestInstance = (instance: TestInstance): ParticipantTestInstance => {
  const sanitizedSections = instance.testContent.sections.map(section => ({
    poolId: section.poolId,
    poolName: section.poolName,
    points: section.points,
    questions: section.questions.map(sanitizeQuestion)
  }));

  const sanitizedContent: ParticipantTestContent = {
    id: instance.testContent.id,
    templateId: instance.testContent.templateId,
    sections: sanitizedSections,
    createdAt: instance.testContent.createdAt
  };

  return {
    ...instance,
    testContent: sanitizedContent
  };
};

const validateStartSessionRequest = (body: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!body.templateId || typeof body.templateId !== 'string' || body.templateId.trim() === '') {
    errors.push('templateId is required and must be a non-empty string');
  }

  if (!body.examinerId || typeof body.examinerId !== 'string' || body.examinerId.trim() === '') {
    errors.push('examinerId is required and must be a non-empty string');
  }

  if (typeof body.timeLimitMinutes !== 'number' || body.timeLimitMinutes <= 0) {
    errors.push('timeLimitMinutes is required and must be a positive number');
  }

  if (!body.startTime || typeof body.startTime !== 'string') {
    errors.push('startTime is required and must be an ISO date string');
  } else {
    const startDate = new Date(body.startTime);
    if (isNaN(startDate.getTime())) {
      errors.push('startTime must be a valid ISO date string');
    }
  }

  if (!body.endTime || typeof body.endTime !== 'string') {
    errors.push('endTime is required and must be an ISO date string');
  } else {
    const endDate = new Date(body.endTime);
    if (isNaN(endDate.getTime())) {
      errors.push('endTime must be a valid ISO date string');
    } else if (body.startTime) {
      const startDate = new Date(body.startTime);
      if (endDate <= startDate) {
        errors.push('endTime must be after startTime');
      }
    }
  }

  if (!Array.isArray(body.participantIdentifiers) || body.participantIdentifiers.length === 0) {
    errors.push('participantIdentifiers is required and must be a non-empty array');
  } else {
    const invalidIdentifiers = body.participantIdentifiers.filter(
      (id: any) => typeof id !== 'string' || id.trim() === ''
    );
    if (invalidIdentifiers.length > 0) {
      errors.push('All participantIdentifiers must be non-empty strings');
    }
  }

  return { valid: errors.length === 0, errors };
};

const validateStartTestInstanceRequest = (body: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!body.accessCode || typeof body.accessCode !== 'string' || body.accessCode.trim() === '') {
    errors.push('accessCode is required and must be a non-empty string');
  }

  return { valid: errors.length === 0, errors };
};

const handleError = (error: AssessmentError, res: Response): Response => {
  switch (error.type) {
    case 'TemplateNotFound':
      return res.status(404).json({
        error: {
          type: error.type,
          templateId: error.templateId,
        },
      });
    case 'SessionNotFound':
      return res.status(404).json({
        error: {
          type: error.type,
          sessionId: error.sessionId,
        },
      });
    case 'TestInstanceNotFound':
      return res.status(404).json({
        error: {
          type: error.type,
          accessCode: error.accessCode,
        },
      });
    case 'InvalidAccessCode':
      return res.status(400).json({
        error: {
          type: error.type,
          accessCode: error.accessCode,
        },
      });
    case 'SessionClosed':
      return res.status(400).json({
        error: {
          type: error.type,
          sessionId: error.sessionId,
          status: error.status,
        },
      });
    case 'TestAlreadyStarted':
      return res.status(409).json({
        error: {
          type: error.type,
          accessCode: error.accessCode,
        },
      });
    case 'TestNotOpenYet':
      return res.status(400).json({
        error: {
          type: error.type,
          accessCode: error.accessCode,
          startTime: error.startTime.toISOString(),
        },
      });
    case 'TestExpired':
      return res.status(400).json({
        error: {
          type: error.type,
          accessCode: error.accessCode,
          endTime: error.endTime.toISOString(),
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
    case 'RepositoryError':
      return res.status(500).json({
        error: {
          type: error.type,
          message: error.message,
        },
      });
    case 'DesignError':
      // Handle nested DesignError - map common ones
      const designError = error.error;
      if (designError.type === 'TemplateNotFound') {
        return res.status(404).json({
          error: {
            type: 'TemplateNotFound',
            templateId: designError.templateId,
          },
        });
      }
      if (designError.type === 'InsufficientQuestions') {
        return res.status(400).json({
          error: {
            type: 'InsufficientQuestions',
            poolId: designError.poolId,
            required: designError.required,
            available: designError.available,
          },
        });
      }
      return res.status(500).json({
        error: {
          type: 'DesignError',
          message: 'A design error occurred',
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

export const createAssessmentRouter = (module: AssessmentModule): Router => {
  const router = Router();

  router.get('/sessions', async (req: Request, res: Response) => {
    try {
      const sessions = await module.listSessions();
      res.status(200).json(sessions);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: {
          type: 'InternalServerError',
          message: 'Failed to list sessions',
        },
      });
    }
  });

  router.post('/sessions', async (req: Request, res: Response) => {
    // Validate request body
    const validation = validateStartSessionRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: {
          type: 'ValidationError',
          message: 'Invalid request body',
          errors: validation.errors,
        },
      });
    }

    try {
      const body: StartSessionRequestBody = req.body;
      const result = await module.startSession({
        templateId: body.templateId,
        examinerId: body.examinerId,
        timeLimitMinutes: body.timeLimitMinutes,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        participantIdentifiers: body.participantIdentifiers,
      });

      if (!result.ok) {
        return handleError(result.error, res);
      }

      res.status(201).json({ sessionId: result.value });
    } catch (error) {
      res.status(500).json({
        error: {
          type: 'InternalServerError',
          message: 'Failed to start session',
        },
      });
    }
  });

  router.get('/sessions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await module.getSessionById(id);

      if (!result.ok) {
        return handleError(result.error, res);
      }

      res.status(200).json({
        session: result.value.session,
        instances: result.value.instances,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: {
          type: 'InternalServerError',
          message: 'Failed to get session',
        },
      });
    }
  });

  router.get('/sessions/:sessionId/report', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const result = await module.getSessionReport(sessionId);

      if (!result.ok) {
        return handleError(result.error, res);
      }

      res.status(200).json(result.value);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: {
          type: 'InternalServerError',
          message: 'Failed to get session report',
        },
      });
    }
  });

  router.post('/start', async (req: Request, res: Response) => {
    // Validate request body
    const validation = validateStartTestInstanceRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: {
          type: 'ValidationError',
          message: 'Invalid request body',
          errors: validation.errors,
        },
      });
    }

    try {
      const body: StartTestInstanceRequestBody = req.body;
      const result = await module.startTestInstance(body.accessCode);

      if (!result.ok) {
        return handleError(result.error, res);
      }

      const participantInstance = toParticipantTestInstance(result.value);
      res.status(200).json(participantInstance);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: {
          type: 'InternalServerError',
          message: 'Failed to start test instance',
        },
      });
    }
  });

  return router;
};

