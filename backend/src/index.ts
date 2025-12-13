import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { createDesignRouter } from './design/http';
import { createAssessmentRouter } from './assessment/http';
import { requireAuth, createModules } from './middleware/auth';
import { configureDesignModule, DesignModuleConfig } from './design/index';
import { configureAssessmentModule } from './assessment/index';
import { SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

dotenv.config();

type TestConfig = {
  designModuleConfig?: DesignModuleConfig & { supabaseClient?: SupabaseClient };
};

export const createApp = (testConfig?: TestConfig): Express => {
  const app = express();

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

  // For tests: create modules using provided Supabase client
  if (testConfig?.designModuleConfig?.supabaseClient) {
    const designModule = configureDesignModule(testConfig.designModuleConfig);
    const assessmentModule = configureAssessmentModule({
      supabaseClient: testConfig.designModuleConfig.supabaseClient,
      materializeTemplate: designModule.materializeTemplate,
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

    // Test middleware that attaches modules to request
    app.use('/api/design', (req, res, next) => {
      (req as any).designModule = designModule;
      (req as any).assessmentModule = assessmentModule;
      next();
    });
    app.use('/api/design', createDesignRouter());

    app.use('/api/assessment', (req, res, next) => {
      (req as any).designModule = designModule;
      (req as any).assessmentModule = assessmentModule;
      next();
    });
    app.use('/api/assessment', createAssessmentRouter());
  } else {
    // Production: use request-scoped modules with authentication
    // Apply authentication middleware to all design routes (creates request-scoped modules)
    app.use('/api/design', requireAuth, createDesignRouter());

    // Assessment routes: some require auth (creates scoped modules), some don't (use anon modules)
    app.use('/api/assessment', createModules, createAssessmentRouter());
  }

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

  const app = createApp();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default createApp;
