import { Request, Response, NextFunction } from 'express';
import { createSupabaseClient } from '../lib/supabase';
import { configureDesignModule, DesignModule } from '../design/index';
import { configureAssessmentModule, AssessmentModule } from '../assessment/index';

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email?: string;
  };
  token: string;
  designModule: DesignModule;
  assessmentModule: AssessmentModule;
};

type RequestWithModules = Request & {
  designModule?: DesignModule;
  assessmentModule?: AssessmentModule;
};

// Helper function to create request-scoped modules
const createScopedModules = (accessToken?: string, ownerId?: string) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be set in environment variables');
  }

  const scopedClient = createSupabaseClient(
    { supabaseUrl, supabaseAnonKey },
    accessToken
  );

  const designModule = configureDesignModule({
    supabaseClient: scopedClient,
    ownerId,
  });

  const assessmentModule = configureAssessmentModule({
    supabaseClient: scopedClient,
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

  return { designModule, assessmentModule };
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);

    // Create a Supabase client to validate the token
    // We use the anon key client for token validation
    const supabaseClient = createSupabaseClient();
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Create request-scoped modules with user's token for RLS
    const { designModule, assessmentModule } = createScopedModules(token, user.id);

    // Attach user info, token, and scoped modules to request
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
    };
    (req as AuthenticatedRequest).token = token;
    (req as AuthenticatedRequest).designModule = designModule;
    (req as AuthenticatedRequest).assessmentModule = assessmentModule;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to create modules for unauthenticated routes (using anon key)
export const createModules = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { designModule, assessmentModule } = createScopedModules();
    (req as RequestWithModules).designModule = designModule;
    (req as RequestWithModules).assessmentModule = assessmentModule;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize modules' });
  }
};
