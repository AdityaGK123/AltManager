import express from 'express';
import { db } from '../db/index.js';
import { goals } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all goals for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log(`[Goals] Fetching goals for user: ${req.userId}`);
    
    let userGoals;
    try {
      userGoals = await db
        .select()
        .from(goals)
        .where(eq(goals.userId, req.userId!));
    } catch (dbError: any) {
      console.error('[Goals] Database error:', dbError);
      if (dbError.message?.includes('does not exist') || dbError.code === '42P01') {
        console.warn('[Goals] Table does not exist, returning empty array');
        return res.json({ goals: [] });
      }
      throw dbError;
    }

    console.log(`[Goals] Found ${userGoals.length} goals`);
    res.json({ goals: userGoals });
  } catch (error: any) {
    console.error('[Goals] Get goals error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch goals',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new goal
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, targetDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Goal title is required' });
    }

    const [newGoal] = await db.insert(goals).values({
      userId: req.userId!,
      title,
      description,
      targetDate: targetDate ? new Date(targetDate) : null,
      completed: false,
      progress: 0,
    }).returning();

    res.status(201).json({ goal: newGoal });
  } catch (error: any) {
    console.error('[Goals] Create goal error:', error);
    res.status(500).json({ 
      error: 'Failed to create goal',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update goal
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const goalId = parseInt(req.params.id);
    const { title, description, targetDate, completed, progress } = req.body;

    // Verify goal belongs to user
    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, req.userId!)))
      .limit(1);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const [updatedGoal] = await db
      .update(goals)
      .set({
        title,
        description,
        targetDate: targetDate ? new Date(targetDate) : null,
        completed,
        progress,
        updatedAt: new Date(),
      })
      .where(eq(goals.id, goalId))
      .returning();

    res.json({ goal: updatedGoal });
  } catch (error: any) {
    console.error('[Goals] Update goal error:', error);
    res.status(500).json({ 
      error: 'Failed to update goal',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete goal
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const goalId = parseInt(req.params.id);

    // Verify goal belongs to user
    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, req.userId!)))
      .limit(1);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await db.delete(goals).where(eq(goals.id, goalId));

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Goals] Delete goal error:', error);
    res.status(500).json({ 
      error: 'Failed to delete goal',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
