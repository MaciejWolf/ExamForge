import { Router, Request, Response } from 'express';
import { TestSession } from './types/testSession';

// Hardcoded mock data adapted from backend_old
const mockSessions: TestSession[] = [
  {
    id: "1",
    templateId: "template-1", // "Math & Physics Combined Test"
    examinerId: "examiner-1",
    timeLimitMinutes: 60,
    startTime: new Date('2025-11-15T09:00:00Z'),
    endTime: new Date('2025-11-15T10:00:00Z'),
    status: 'completed',
    createdAt: new Date('2025-11-15T08:00:00Z'),
    updatedAt: new Date('2025-11-15T10:00:00Z'),
  },
  {
    id: "2",
    templateId: "template-2", // "Science Comprehensive Exam"
    examinerId: "examiner-1",
    timeLimitMinutes: 45,
    startTime: new Date('2025-11-14T10:00:00Z'),
    endTime: new Date('2025-11-14T10:45:00Z'),
    status: 'open', // Was 'active'
    createdAt: new Date('2025-11-14T09:00:00Z'),
    updatedAt: new Date('2025-11-14T09:00:00Z'),
  },
  {
    id: "3",
    templateId: "template-3", // "Computer Science Basics"
    examinerId: "examiner-1",
    timeLimitMinutes: 90,
    startTime: new Date('2025-11-13T14:00:00Z'),
    endTime: new Date('2025-11-13T15:30:00Z'),
    status: 'completed',
    createdAt: new Date('2025-11-13T13:00:00Z'),
    updatedAt: new Date('2025-11-13T15:30:00Z'),
  },
  {
    id: "4",
    templateId: "template-4", // "General Knowledge Test"
    examinerId: "examiner-1",
    timeLimitMinutes: 30,
    startTime: new Date('2025-11-12T11:00:00Z'),
    endTime: new Date('2025-11-12T11:30:00Z'),
    status: 'open', // Was 'active'
    createdAt: new Date('2025-11-12T10:00:00Z'),
    updatedAt: new Date('2025-11-12T10:00:00Z'),
  },
];

export const createAssessmentRouter = (): Router => {
  const router = Router();

  router.get('/sessions', (req: Request, res: Response) => {
    res.status(200).json(mockSessions);
  });

  return router;
};

