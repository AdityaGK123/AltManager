import express from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth';
import { storage } from '../storage';
import { authRateLimit, requireEmailVerification, requireAuth } from '../middleware/auth';
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  emailVerificationSchema,
} from '@shared/schema';

const router = express.Router();
const authService = new AuthService(storage);

// Helper to get device info from request
function getDeviceInfo(req: express.Request): string {
  const userAgent = req.get('User-Agent') || 'Unknown';
  return userAgent.substring(0, 200); // Truncate for storage
}

// Helper to get client IP
function getClientIP(req: express.Request): string {
  return req.ip || req.socket.remoteAddress || 'Unknown';
}

// Sign up
router.post('/signup', authRateLimit(10, 15 * 60 * 1000), async (req, res) => {
  try {
    const validatedData = signUpSchema.parse(req.body);
    
    const { user, verificationToken } = await authService.signUp(validatedData);
    
    // Send welcome and verification emails
    try {
      const { sendWelcome, sendEmailVerification } = await import('../services/email');
      const verificationUrl = `${process.env.NODE_ENV === 'production' ? 'https://hipoaicoach.com' : 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
      const appUrl = process.env.NODE_ENV === 'production' ? 'https://hipoaicoach.com' : 'http://localhost:5000';
      
      // Send welcome email
      await sendWelcome(user.email, {
        firstName: user.firstName || undefined,
        appUrl
      });
      
      // Send verification email
      await sendEmailVerification(user.email, {
        firstName: user.firstName || 'there',
        verificationUrl
      });
    } catch (emailError) {
      console.error('Failed to send signup emails:', emailError);
    }
    
    res.status(201).json({
      message: 'Account created successfully. Please check your email for verification.',
      userId: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error('Sign up error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message,
      });
    }
    
    res.status(500).json({ error: 'Internal server error during account creation' });
  }
});

// Sign in
router.post('/signin', authRateLimit(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const validatedData = signInSchema.parse(req.body);
    const deviceInfo = getDeviceInfo(req);
    const ipAddress = getClientIP(req);
    
    const { user, sessionToken } = await authService.signIn(validatedData, deviceInfo, ipAddress);
    
    // Set session token as HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: validatedData.rememberMe 
        ? 30 * 24 * 60 * 60 * 1000 // 30 days
        : 7 * 24 * 60 * 60 * 1000,  // 7 days
    };
    
    res.cookie('sessionToken', sessionToken, cookieOptions);
    
    res.json({
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        currentRole: user.currentRole,
        industry: user.industry,
        careerStage: user.careerStage,
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    if (error instanceof Error) {
      return res.status(401).json({
        error: error.message,
      });
    }
    
    res.status(500).json({ error: 'Internal server error during sign in' });
  }
});

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const sessionToken = req.cookies.sessionToken;
    
    if (sessionToken) {
      await authService.revokeSession(sessionToken);
    }
    
    res.clearCookie('sessionToken');
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: 'Internal server error during sign out' });
  }
});

// Email verification
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = emailVerificationSchema.parse(req.body);
    
    const email = await authService.verifyEmailToken(token);
    
    if (!email) {
      return res.status(400).json({
        error: 'Invalid or expired verification token',
      });
    }
    
    res.json({
      message: 'Email verified successfully',
      email,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    res.status(500).json({ error: 'Internal server error during email verification' });
  }
});

// Forgot password
router.post('/forgot-password', authRateLimit(3, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    
    const resetToken = await authService.requestPasswordReset({ email });
    
    if (resetToken) {
      // Send password reset email with resetToken
      try {
        const { sendPasswordReset } = await import('../services/email');
        const resetUrl = `${process.env.NODE_ENV === 'production' ? 'https://hipoaicoach.com' : 'http://localhost:5000'}/reset-password?token=${resetToken}`;
        const user = await authService.getUserByEmail(email);
        await sendPasswordReset(email, {
          firstName: user?.firstName || undefined,
          resetUrl
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
      }
    }
    
    // Always return success to prevent email enumeration
    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password', authRateLimit(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    
    const success = await authService.resetPassword(token, password);
    
    if (!success) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
      });
    }
    
    res.json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    res.status(500).json({ error: 'Internal server error during password reset' });
  }
});

// Change password (authenticated)
router.post('/change-password', requireAuth, requireEmailVerification, authRateLimit(3, 15 * 60 * 1000), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const validatedData = changePasswordSchema.parse(req.body);
    
    await authService.changePassword(req.user.id, validatedData);
    
    // Clear session cookie to force re-login
    res.clearCookie('sessionToken');
    
    res.json({
      message: 'Password changed successfully. Please sign in again.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message,
      });
    }
    
    res.status(500).json({ error: 'Internal server error during password change' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        emailVerified: req.user.emailVerified,
        currentRole: req.user.currentRole,
        industry: req.user.industry,
        careerStage: req.user.careerStage,
        fiveYearGoal: req.user.fiveYearGoal,
        biggestChallenge: req.user.biggestChallenge,
        workEnvironment: req.user.workEnvironment,
        primaryCoaches: req.user.primaryCoaches,
        mfaEnabled: req.user.mfaEnabled,
        lastLoginAt: req.user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user sessions
router.get('/sessions', requireAuth, requireEmailVerification, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const sessions = await storage.getUserSessions(req.user.id);
    const currentSessionToken = req.cookies.sessionToken;
    
    const sanitizedSessions = sessions.map(session => ({
      id: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      lastActive: session.lastActive,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: session.sessionToken === currentSessionToken,
    }));
    
    res.json({ sessions: sanitizedSessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Revoke session
router.delete('/sessions/:sessionId', requireAuth, requireEmailVerification, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { sessionId } = req.params;
    const session = await storage.getUserSession(sessionId);
    
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    await storage.deleteUserSession(sessionId);
    
    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account
router.delete('/account', requireAuth, requireEmailVerification, authRateLimit(1, 60 * 60 * 1000), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { exportData } = await authService.deleteAccount(req.user.id);
    
    // Clear session cookie
    res.clearCookie('sessionToken');
    
    res.json({
      message: 'Account deleted successfully',
      exportData, // User can download their data
    });
  } catch (error) {
    console.error('Delete account error:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message,
      });
    }
    
    res.status(500).json({ error: 'Internal server error during account deletion' });
  }
});

export { router as authRouter };