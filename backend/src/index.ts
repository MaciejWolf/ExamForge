import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import { verifyAuth, AuthRequest } from './middleware/auth';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies. This is needed for POST/PUT requests.
app.use(express.json());

// --- Swagger UI ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize Supabase client
const supabaseUrl = process.env.PROJECT_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- API Endpoints ---

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Responds if the app is up and running
 *     responses:
 *       200:
 *         description: App is up and running
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API is up and running' });
});

/**
 * @swagger
 * /echo:
 *   post:
 *     summary: Echo endpoint
 *     description: Echoes the request body
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: The echoed request body
 */
app.post('/echo', (req: Request, res: Response) => {
  res.status(200).json({ received: req.body });
});

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify authentication token
 *     description: Verifies a Supabase JWT token and returns user information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid, returns user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Invalid or missing token
 */
app.post('/api/auth/verify', verifyAuth, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    valid: true,
    user: {
      id: req.user?.id,
      email: req.user?.email,
    },
  });
});

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get authenticated user information
 *     description: Returns information about the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Invalid or missing token
 */
app.get('/api/auth/user', verifyAuth, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    id: req.user?.id,
    email: req.user?.email,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
