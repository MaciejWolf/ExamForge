import { Router, Response } from 'express';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import * as mockDataService from '../services/mockData';

const router = Router();

/**
 * @swagger
 * /api/question-pools:
 *   get:
 *     summary: Get all question pools for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of question pools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pools:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       questionCount:
 *                         type: number
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

    const pools = mockDataService.getPoolsByExaminer(examinerId);
    res.status(200).json({ pools });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/question-pools:
 *   post:
 *     summary: Create a new question pool
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pool created successfully
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

    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Pool name is required' });
    }

    const newPool = mockDataService.createPool(name.trim(), examinerId);
    res.status(201).json(newPool);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/question-pools/{id}:
 *   put:
 *     summary: Update a question pool
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pool updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pool not found
 */
router.put('/:id', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Pool name is required' });
    }

    const updatedPool = mockDataService.updatePool(id, name.trim(), examinerId);

    if (!updatedPool) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    res.status(200).json(updatedPool);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/question-pools/{id}:
 *   delete:
 *     summary: Delete a question pool
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
 *         description: Pool deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pool not found
 */
router.delete('/:id', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const deleted = mockDataService.deletePool(id, examinerId);

    if (!deleted) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    res.status(200).json({ message: 'Pool deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

