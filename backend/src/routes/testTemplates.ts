import { Router, Response } from 'express';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import * as mockDataService from '../services/mockData';

const router = Router();

/**
 * @swagger
 * /api/test-templates:
 *   get:
 *     summary: Get all test templates for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 templates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       examiner_id:
 *                         type: string
 *                       poolSelections:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             poolId:
 *                               type: string
 *                             questionsToDraw:
 *                               type: number
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

    const templates = mockDataService.getTemplatesByExaminer(examinerId);
    res.status(200).json({ templates });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/test-templates/{id}:
 *   get:
 *     summary: Get a test template by ID
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
 *         description: Test template details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Template not found
 */
router.get('/:id', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const template = mockDataService.getTemplateById(id, examinerId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/test-templates:
 *   post:
 *     summary: Create a new test template
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
 *               - poolSelections
 *             properties:
 *               name:
 *                 type: string
 *               poolSelections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - poolId
 *                     - questionsToDraw
 *                   properties:
 *                     poolId:
 *                       type: string
 *                     questionsToDraw:
 *                       type: number
 *     responses:
 *       201:
 *         description: Template created successfully
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

    const { name, poolSelections } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    if (!poolSelections || !Array.isArray(poolSelections) || poolSelections.length === 0) {
      return res.status(400).json({ error: 'At least one pool selection is required' });
    }

    try {
      const newTemplate = mockDataService.createTemplate(name, poolSelections, examinerId);
      res.status(201).json(newTemplate);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create template';
      return res.status(400).json({ error: errorMessage });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/test-templates/{id}:
 *   put:
 *     summary: Update a test template
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
 *               - poolSelections
 *             properties:
 *               name:
 *                 type: string
 *               poolSelections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - poolId
 *                     - questionsToDraw
 *                   properties:
 *                     poolId:
 *                       type: string
 *                     questionsToDraw:
 *                       type: number
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Template not found
 */
router.put('/:id', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const { name, poolSelections } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    if (!poolSelections || !Array.isArray(poolSelections) || poolSelections.length === 0) {
      return res.status(400).json({ error: 'At least one pool selection is required' });
    }

    try {
      const updatedTemplate = mockDataService.updateTemplate(id, name, poolSelections, examinerId);

      if (!updatedTemplate) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.status(200).json(updatedTemplate);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update template';
      return res.status(400).json({ error: errorMessage });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/test-templates/{id}:
 *   delete:
 *     summary: Delete a test template
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
 *         description: Template deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Template not found
 */
router.delete('/:id', verifyAuth, (req: AuthRequest, res: Response) => {
  try {
    const examinerId = req.user?.id;
    if (!examinerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const deleted = mockDataService.deleteTemplate(id, examinerId);

    if (!deleted) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

