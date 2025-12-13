import { Request, Response, NextFunction } from 'express';
import { createSupabaseClient } from '../lib/supabase';

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email?: string;
  };
  token: string;
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

    // Attach user info and token to request for downstream use
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
    };
    (req as AuthenticatedRequest).token = token;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
