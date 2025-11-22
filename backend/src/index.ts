import express, { Express } from 'express';
import cors from 'cors';
import { configureDesignModule, DesignModuleConfig } from './design/index';
import { createDesignRouter } from './design/http';
import { createSupabaseClient } from './lib/supabase';
import dotenv from 'dotenv';

dotenv.config();

export const createApp = (config: { designModuleConfig?: DesignModuleConfig } = {}): Express => {
  const app = express();

  // CORS middleware - allow requests from frontend
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow localhost on any port for development
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }

      // Allow specific frontend URL from environment
      const allowedOrigin = process.env.FRONTEND_URL;
      if (allowedOrigin && origin === allowedOrigin) {
        return callback(null, true);
      }

      callback(null, true); // Allow all origins in development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());

  app.use('/api/design', createDesignRouter(configureDesignModule(config.designModuleConfig)));

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
