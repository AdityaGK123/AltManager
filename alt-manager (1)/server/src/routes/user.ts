import express from 'express';
import { db } from '../db/index.js';
import { users, userProfiles } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log(`[User] Fetching profile for user: ${req.userId}`);
    
    let user, profile;
    try {
      [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    } catch (dbError: any) {
      console.error('[User] Database error fetching user:', dbError);
      if (dbError.message?.includes('does not exist') || dbError.code === '42P01') {
        return res.status(500).json({ error: 'Users table not found' });
      }
      throw dbError;
    }
    
    try {
      [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, req.userId!)).limit(1);
    } catch (dbError: any) {
      console.warn('[User] user_profiles table error:', dbError.message);
      // Create default profile if table exists but no profile found
      profile = null;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If no profile exists, return user data with default profile
    if (!profile) {
      console.warn(`[User] No profile found for user ${req.userId}, returning defaults`);
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
        },
        profile: {
          roleTitle: null,
          experienceYears: 0,
          careerGoals: null,
          currentChallenges: null,
          managerTone: 'balanced',
          onboardingCompleted: false,
          level: 1,
          experiencePoints: 0,
        },
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
      profile: {
        roleTitle: profile.roleTitle,
        experienceYears: profile.experienceYears,
        careerGoals: profile.careerGoals,
        currentChallenges: profile.currentChallenges,
        managerTone: profile.managerTone,
        onboardingCompleted: profile.onboardingCompleted,
        level: profile.level,
        experiencePoints: profile.experiencePoints,
      },
    });
  } catch (error: any) {
    console.error('[User] Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { roleTitle, experienceYears, careerGoals, currentChallenges, managerTone, onboardingCompleted } = req.body;

    const [updatedProfile] = await db
      .update(userProfiles)
      .set({
        roleTitle,
        experienceYears,
        careerGoals,
        currentChallenges,
        managerTone,
        onboardingCompleted,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, req.userId!))
      .returning();

    res.json({ profile: updatedProfile });
  } catch (error: any) {
    console.error('[User] Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user name
router.put('/name', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const [updatedUser] = await db
      .update(users)
      .set({ firstName, lastName, updatedAt: new Date() })
      .where(eq(users.id, req.userId!))
      .returning();

    res.json({ user: updatedUser });
  } catch (error: any) {
    console.error('[User] Update name error:', error);
    res.status(500).json({ 
      error: 'Failed to update name',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
