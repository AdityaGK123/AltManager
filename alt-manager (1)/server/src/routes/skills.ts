import express from 'express';
import { db } from '../db/index.js';
import { skills } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all skills for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log(`[Skills] Fetching skills for user: ${req.userId}`);
    
    let userSkills;
    try {
      userSkills = await db
        .select()
        .from(skills)
        .where(eq(skills.userId, req.userId!));
    } catch (dbError: any) {
      console.error('[Skills] Database error:', dbError);
      if (dbError.message?.includes('does not exist') || dbError.code === '42P01') {
        console.warn('[Skills] Table does not exist, returning empty array');
        return res.json({ skills: [] });
      }
      throw dbError;
    }

    console.log(`[Skills] Found ${userSkills.length} skills`);
    res.json({ skills: userSkills });
  } catch (error: any) {
    console.error('[Skills] Get skills error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch skills',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new skill
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, category, currentLevel, targetLevel } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    // Check for duplicate skill name (case-insensitive)
    const existingSkills = await db
      .select()
      .from(skills)
      .where(eq(skills.userId, req.userId!));
    
    const duplicateSkill = existingSkills.find(
      s => s.name.toLowerCase().trim() === name.toLowerCase().trim()
    );

    if (duplicateSkill) {
      return res.status(409).json({ 
        error: 'Skill already exists',
        message: `You already have a skill named "${duplicateSkill.name}". Please choose a different name.`
      });
    }

    const [newSkill] = await db.insert(skills).values({
      userId: req.userId!,
      name: name.trim(),
      category: category?.trim(),
      currentLevel: currentLevel || 0,
      targetLevel: targetLevel || 100,
      progress: 0,
    }).returning();

    res.status(201).json({ skill: newSkill });
  } catch (error: any) {
    console.error('[Skills] Create skill error:', error);
    res.status(500).json({ 
      error: 'Failed to create skill',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update skill
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const skillId = parseInt(req.params.id);
    const { name, category, currentLevel, targetLevel, progress } = req.body;

    // Verify skill belongs to user
    const [skill] = await db
      .select()
      .from(skills)
      .where(and(eq(skills.id, skillId), eq(skills.userId, req.userId!)))
      .limit(1);

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const [updatedSkill] = await db
      .update(skills)
      .set({
        name,
        category,
        currentLevel,
        targetLevel,
        progress,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skillId))
      .returning();

    res.json({ skill: updatedSkill });
  } catch (error: any) {
    console.error('[Skills] Update skill error:', error);
    res.status(500).json({ 
      error: 'Failed to update skill',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete skill
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const skillId = parseInt(req.params.id);

    // Verify skill belongs to user
    const [skill] = await db
      .select()
      .from(skills)
      .where(and(eq(skills.id, skillId), eq(skills.userId, req.userId!)))
      .limit(1);

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    await db.delete(skills).where(eq(skills.id, skillId));

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Skills] Delete skill error:', error);
    res.status(500).json({ 
      error: 'Failed to delete skill',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
