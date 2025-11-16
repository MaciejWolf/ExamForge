import { Router, Response } from 'express';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import * as mockDataService from '../services/mockData';

const router = Router();

/**
 * @swagger
 * /api/test-sessions:
 *   post:
 *     summary: Create a new test session
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - timeLimitMinutes
 *               - participants
 *             properties:
 *               templateId:
 *                 type: string
 *               timeLimitMinutes:
 *                 type: number
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Test session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     template_id:
 *                       type: string
 *                     examiner_id:
 *                       type: string
 *                     time_limit_minutes:
 *                       type: number
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       session_id:
 *                         type: string
 *                       identifier:
 *                         type: string
 *                       access_code:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { templateId, timeLimitMinutes, participants } = req.body;

    if (!templateId || typeof templateId !== 'string' || !templateId.trim()) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    if (!timeLimitMinutes || typeof timeLimitMinutes !== 'number') {
      return res.status(400).json({ error: 'Time limit in minutes is required' });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'At least one participant identifier is required' });
    }

    try {
      const result = mockDataService.createTestSession(
        templateId.trim(),
        timeLimitMinutes,
        participants,
        examinerId
      );
      res.status(201).json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create test session';
      return res.status(400).json({ error: errorMessage });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/test-sessions:
 *   get:
 *     summary: Get all test sessions for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       template_id:
 *                         type: string
 *                       examiner_id:
 *                         type: string
 *                       time_limit_minutes:
 *                         type: number
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const sessions = mockDataService.getTestSessionsByExaminer(examinerId);
    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/test-sessions/{id}:
 *   get:
 *     summary: Get a test session by ID with participants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test session details with participants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: object
 *                 participants:
 *                   type: array
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.get('/:id', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const session = mockDataService.getTestSessionById(id, examinerId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const participants = mockDataService.getParticipantsBySession(id, examinerId);

    res.status(200).json({ session, participants });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

