import { Router, Response } from 'express';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import * as mockDataService from '../services/mockData';

const router = Router({ mergeParams: true }); // mergeParams to access poolId from parent route

/**
 * @swagger
 * /api/question-pools/{poolId}/questions:
 *   get:
 *     summary: Get all questions for a specific question pool
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       content:
 *                         type: string
 *                       answers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             text:
 *                               type: string
 *                             isCorrect:
 *                               type: boolean
 *                       createdAt:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pool not found
 */
router.get('/', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { poolId } = req.params;

    // Verify pool exists and belongs to examiner
    const pool = mockDataService.getPoolById(poolId, examinerId);
    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    const questions = mockDataService.getQuestionsByPool(poolId, examinerId);
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/question-pools/{poolId}/questions:
 *   post:
 *     summary: Create a new question in a question pool
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poolId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - answers
 *             properties:
 *               content:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - text
 *                     - isCorrect
 *                   properties:
 *                     text:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pool not found
 */
router.post('/', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { poolId } = req.params;
    const { content, answers } = req.body;

    // Validate pool exists
    const pool = mockDataService.getPoolById(poolId, examinerId);
    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    // Validate input
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Question content is required' });
    }

    if (!Array.isArray(answers) || answers.length < 2 || answers.length > 6) {
      return res.status(400).json({ error: 'Question must have between 2 and 6 answers' });
    }

    // Validate answers structure
    for (const answer of answers) {
      if (!answer.text || typeof answer.text !== 'string' || !answer.text.trim()) {
        return res.status(400).json({ error: 'All answers must have non-empty text' });
      }
      if (typeof answer.isCorrect !== 'boolean') {
        return res.status(400).json({ error: 'All answers must have a valid isCorrect boolean value' });
      }
    }

    // Validate exactly one correct answer
    const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
    if (correctAnswers !== 1) {
      return res.status(400).json({ error: 'Question must have exactly one correct answer' });
    }

    const newQuestion = mockDataService.createQuestion(
      poolId,
      content.trim(),
      answers,
      examinerId
    );

    if (!newQuestion) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    res.status(201).json(newQuestion);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/question-pools/{poolId}/questions/{questionId}:
 *   put:
 *     summary: Update a question in a question pool
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poolId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - answers
 *             properties:
 *               content:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - text
 *                     - isCorrect
 *                   properties:
 *                     text:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question or pool not found
 */
router.put('/:questionId', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { poolId, questionId } = req.params;
    const { content, answers } = req.body;

    // Validate pool exists
    const pool = mockDataService.getPoolById(poolId, examinerId);
    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    // Validate input
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Question content is required' });
    }

    if (!Array.isArray(answers) || answers.length < 2 || answers.length > 6) {
      return res.status(400).json({ error: 'Question must have between 2 and 6 answers' });
    }

    // Validate answers structure
    for (const answer of answers) {
      if (!answer.text || typeof answer.text !== 'string' || !answer.text.trim()) {
        return res.status(400).json({ error: 'All answers must have non-empty text' });
      }
      if (typeof answer.isCorrect !== 'boolean') {
        return res.status(400).json({ error: 'All answers must have a valid isCorrect boolean value' });
      }
    }

    // Validate exactly one correct answer
    const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
    if (correctAnswers !== 1) {
      return res.status(400).json({ error: 'Question must have exactly one correct answer' });
    }

    const updatedQuestion = mockDataService.updateQuestion(
      questionId,
      poolId,
      content.trim(),
      answers,
      examinerId
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.status(200).json(updatedQuestion);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/question-pools/{poolId}/questions/{questionId}:
 *   delete:
 *     summary: Delete a question from a question pool
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poolId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question or pool not found
 */
router.delete('/:questionId', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { poolId, questionId } = req.params;

    // Verify pool exists
    const pool = mockDataService.getPoolById(poolId, examinerId);
    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    const deleted = mockDataService.deleteQuestion(questionId, poolId, examinerId);

    if (!deleted) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

