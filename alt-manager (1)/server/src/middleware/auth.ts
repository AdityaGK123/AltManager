import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('[Auth] JWT_SECRET is not configured');
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: process.env.NODE_ENV === 'development' ? 'JWT_SECRET not set' : undefined
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    console.error('[Auth] Token verification failed:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
