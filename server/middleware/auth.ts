import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth';
import { storage } from '../storage';
import { User } from '@shared/schema';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const authService = new AuthService(storage);

// Middleware to validate session and attach user to request
export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Remove test user auto-creation to prevent sample data leakage

    // Production/session-based authentication
    const sessionToken = req.cookies.sessionToken;
    
    if (!sessionToken) {
      req.user = undefined;
      return next();
    }

    // Validate session token
    const user = await authService.validateSession(sessionToken);
    req.user = user || undefined;
    
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    req.user = undefined;
    next();
  }
};

// Middleware to require authentication
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  // Check if user account is active
  if (!req.user.isActive) {
    res.status(401).json({ error: 'Account is deactivated' });
    return;
  }
  
  next();
};

// Middleware to require email verification
export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || !req.user.emailVerified) {
    res.status(403).json({ 
      error: 'Email verification required',
      message: 'Please verify your email address to access this feature'
    });
    return;
  }
  
  next();
};

// Rate limiting for authentication endpoints
const authAttempts = new Map<string, { count: number; resetTime: number }>();

export const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const attempts = authAttempts.get(key);
    
    if (!attempts || now > attempts.resetTime) {
      // First attempt or window expired
      authAttempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (attempts.count >= maxAttempts) {
      res.status(429).json({
        error: 'Too many authentication attempts',
        message: 'Please try again later',
        resetTime: new Date(attempts.resetTime).toISOString(),
      });
      return;
    }
    
    // Increment attempt count
    attempts.count++;
    authAttempts.set(key, attempts);
    next();
  };
};