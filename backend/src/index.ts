import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { configureDesignModule, DesignModuleConfig } from './design/index';
import { createDesignRouter } from './design/http';
import { configureAssessmentModule } from './assessment/index';
import { createAssessmentRouter } from './assessment/http';
import { createSupabaseClient } from './lib/supabase';
import { requireAuth } from './middleware/auth';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

dotenv.config();

export const createApp = (config: { designModuleConfig?: DesignModuleConfig } = {}): Express => {
  const app = express();
  const designModule = configureDesignModule(config.designModuleConfig);
  const assessmentModule = configureAssessmentModule({
    materializeTemplate: designModule.materializeTemplate,
    supabaseClient: config.designModuleConfig?.supabaseClient,
    templateProvider: {
      getTemplateNames: async (ids: string[]) => {
        const uniqueIds = Array.from(new Set(ids));
        const names = new Map<string, string>();

        const result = await designModule.getTemplatesByIds(uniqueIds);

        if (result.ok) {
          result.value.forEach(template => {
            names.set(template.id, template.name);
          });
        }

        return names;
      }
    }
  });

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      const allowedOrigin = process.env.FRONTEND_URL;
      if (allowedOrigin && origin === allowedOrigin) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());

  // Swagger UI – uses the same spec we log
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

  // Apply authentication middleware to all design routes
  app.use('/api/design', requireAuth, createDesignRouter(designModule));
  app.use('/api/assessment', createAssessmentRouter(assessmentModule));

  return app;
};

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
    process.exit(1);
  }

  const supabaseClient = createSupabaseClient({
    supabaseUrl,
    supabaseAnonKey,
  });

  const app = createApp({
    designModuleConfig: {
      supabaseClient,
    },
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default createApp;
