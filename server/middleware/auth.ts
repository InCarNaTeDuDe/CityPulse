import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';
import { User } from '../db/entities/User.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

const authService = new AuthService();

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userName = req.headers['x-user-name'] as string || 'Guest User';
  const userEmail = req.headers['x-user-email'] as string || 'guest@example.com';
  const userAvatar = req.headers['x-user-avatar'] as string || '';

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing x-user-id header.' });
  }

  try {
    const profile = await authService.getOrCreateProfile(userId, userName, userEmail, userAvatar);
    req.user = profile;
    next();
  } catch (err: any) {
    res.status(500).json({ error: `Authentication failed: ${err.message}` });
  }
};
