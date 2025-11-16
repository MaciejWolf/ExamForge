import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../lib/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export const verifyAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);

    const { data: { user }, error } = await getSupabaseClient().auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

