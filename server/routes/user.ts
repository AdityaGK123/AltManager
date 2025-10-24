import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { requireAuth } from '../middleware/auth';
import { updateUserProfileSchema } from '@shared/schema';

const router = express.Router();

// Schema for notification preferences update
const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  weeklyDigest: z.boolean(),
  coachingReminders: z.boolean(),
});

// Get user notification preferences
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return notification preferences
    res.json({
      emailNotifications: user.emailNotifications ?? true,
      marketingEmails: user.marketingEmails ?? false,
      weeklyDigest: user.weeklyDigest ?? true,
      coachingReminders: user.coachingReminders ?? true,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user notification preferences
router.put('/notifications', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const validatedData = notificationPreferencesSchema.parse(req.body);

    const updatedUser = await storage.updateUser(userId, {
      emailNotifications: validatedData.emailNotifications,
      marketingEmails: validatedData.marketingEmails,
      weeklyDigest: validatedData.weeklyDigest,
      coachingReminders: validatedData.coachingReminders,
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Notification preferences updated successfully',
      preferences: {
        emailNotifications: updatedUser.emailNotifications,
        marketingEmails: updatedUser.marketingEmails,
        weeklyDigest: updatedUser.weeklyDigest,
        coachingReminders: updatedUser.coachingReminders,
      },
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const profile = await storage.getUserProfile(userId);
    
    if (!profile) {
      // Return a default empty profile if none exists
      return res.json({
        currentRole: null,
        industry: null,
        careerStage: null,
        fiveYearGoal: null,
        biggestChallenge: null,
        workEnvironment: null,
        primaryCoaches: null,
        isOnboardingComplete: false,
      });
    }

    res.json({
      currentRole: profile.currentRole,
      industry: profile.industry,
      careerStage: profile.careerStage,
      fiveYearGoal: profile.fiveYearGoal,
      biggestChallenge: profile.biggestChallenge,
      workEnvironment: profile.workEnvironment,
      primaryCoaches: profile.primaryCoaches,
      isOnboardingComplete: profile.isOnboardingComplete,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const validatedData = updateUserProfileSchema.parse(req.body);

    // Update user table to keep /auth/me in sync
    await storage.updateUser(userId, {
      currentRole: validatedData.currentRole,
      industry: validatedData.industry,
      careerStage: validatedData.careerStage,
      fiveYearGoal: validatedData.fiveYearGoal,
      biggestChallenge: validatedData.biggestChallenge,
      workEnvironment: validatedData.workEnvironment,
      primaryCoaches: validatedData.primaryCoaches,
      updatedAt: new Date(),
    });

    // Upsert user profile (canonical store for onboarding completion)
    const updatedProfile = await storage.upsertUserProfile(userId, validatedData);

    res.json({
      message: 'Profile updated successfully',
      profile: {
        currentRole: updatedProfile.currentRole,
        industry: updatedProfile.industry,
        careerStage: updatedProfile.careerStage,
        fiveYearGoal: updatedProfile.fiveYearGoal,
        biggestChallenge: updatedProfile.biggestChallenge,
        workEnvironment: updatedProfile.workEnvironment,
        primaryCoaches: updatedProfile.primaryCoaches,
        isOnboardingComplete: updatedProfile.isOnboardingComplete,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as userRouter };