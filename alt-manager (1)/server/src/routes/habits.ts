import express from 'express';
import { db } from '../db/index.js';
import { habits } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all habits for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log(`[Habits] Fetching habits for user: ${req.userId}`);
    
    let userHabits;
    try {
      userHabits = await db
        .select()
        .from(habits)
        .where(eq(habits.userId, req.userId!));
    } catch (dbError: any) {
      console.error('[Habits] Database error:', dbError);
      // Return empty array if table doesn't exist
      if (dbError.message?.includes('does not exist') || dbError.code === '42P01') {
        console.warn('[Habits] Table does not exist, returning empty array');
        return res.json({ habits: [] });
      }
      throw dbError;
    }

    console.log(`[Habits] Found ${userHabits.length} habits`);
    res.json({ habits: userHabits });
  } catch (error: any) {
    console.error('[Habits] Get habits error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch habits',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new habit
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, frequency } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Habit title is required' });
    }

    const [newHabit] = await db.insert(habits).values({
      userId: req.userId!,
      title,
      description,
      frequency: frequency || 'daily',
      streak: 0,
    }).returning();

    res.status(201).json({ habit: newHabit });
  } catch (error: any) {
    console.error('[Habits] Create habit error:', error);
    res.status(500).json({ 
      error: 'Failed to create habit',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update habit (mark as completed, update streak)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const { title, description, frequency, streak, lastCompletedAt } = req.body;

    // Verify habit belongs to user
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, req.userId!)))
      .limit(1);

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const [updatedHabit] = await db
      .update(habits)
      .set({
        title,
        description,
        frequency,
        streak,
        lastCompletedAt: lastCompletedAt ? new Date(lastCompletedAt) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(habits.id, habitId))
      .returning();

    res.json({ habit: updatedHabit });
  } catch (error: any) {
    console.error('[Habits] Update habit error:', error);
    res.status(500).json({ 
      error: 'Failed to update habit',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark habit as completed today
router.post('/:id/complete', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const habitId = parseInt(req.params.id);

    // Verify habit belongs to user
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, req.userId!)))
      .limit(1);

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Check if already completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCompleted = habit.lastCompletedAt ? new Date(habit.lastCompletedAt) : null;
    const isCompletedToday = lastCompleted && lastCompleted >= today;

    if (isCompletedToday) {
      return res.json({ habit, message: 'Already completed today' });
    }

    // Update streak
    const newStreak = (habit.streak || 0) + 1;

    const [updatedHabit] = await db
      .update(habits)
      .set({
        streak: newStreak,
        lastCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(habits.id, habitId))
      .returning();

    res.json({ habit: updatedHabit });
  } catch (error: any) {
    console.error('[Habits] Complete habit error:', error);
    res.status(500).json({ 
      error: 'Failed to complete habit',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete habit
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const habitId = parseInt(req.params.id);

    // Verify habit belongs to user
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, req.userId!)))
      .limit(1);

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    await db.delete(habits).where(eq(habits.id, habitId));

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Habits] Delete habit error:', error);
    res.status(500).json({ 
      error: 'Failed to delete habit',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
