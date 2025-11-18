import express from 'express';
import { db } from '../db/index.js';
import { achievements } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all achievements for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log(`[Achievements] Fetching achievements for user: ${req.userId}`);
    
    let userAchievements;
    try {
      // Note: achievements table doesn't have user_id column, returning all achievements
      userAchievements = await db
        .select()
        .from(achievements);
    } catch (dbError: any) {
      console.error('[Achievements] Database error:', dbError);
      // Return empty array if table doesn't exist or column missing
      if (dbError.message?.includes('does not exist') || dbError.code === '42P01' || dbError.code === '42703') {
        console.warn('[Achievements] Table does not exist, returning empty array');
        return res.json({ achievements: [] });
      }
      throw dbError;
    }

    console.log(`[Achievements] Found ${userAchievements.length} achievements`);
    res.json({ achievements: userAchievements });
  } catch (error: any) {
    console.error('[Achievements] Get achievements error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch achievements',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Award achievement (internal use or admin)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [newAchievement] = await db.insert(achievements).values({
      name,
      description,
    }).returning();

    res.status(201).json({ achievement: newAchievement });
  } catch (error: any) {
    console.error('[Achievements] Create achievement error:', error);
    res.status(500).json({ 
      error: 'Failed to create achievement',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
