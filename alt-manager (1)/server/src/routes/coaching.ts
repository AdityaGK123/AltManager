import { Router } from 'express';
import { db } from '../db/index.js';
import {
  userMomentFeedback,
  userBadges,
  userXpTracking,
  userInsightTimeline,
  conversationMemory,
  momentCompletions,
  managerMoments,
} from '../db/schema.js';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { conversationalCoachingService } from '../services/conversationalCoachingService.js';
import { badgeService } from '../services/badgeService.js';
import { momentsAIService } from '../services/momentsAIService.js';

const router = Router();

/**
 * POST /api/moments/:id/coach
 * Generate intelligent coaching feedback with rubric evaluation
 */
router.post('/:id/coach', authenticateToken, async (req: AuthRequest, res) => {
  const startTime = Date.now();
  const momentId = req.params.id;
  const userId = req.userId!;
  const { sessionId, completionId } = req.body;

  try {
    console.log(`[Coaching] Starting coaching for moment ${momentId}, user ${userId}`);

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    // Get completion
    const [completion] = await db
      .select()
      .from(momentCompletions)
      .where(and(
        eq(momentCompletions.sessionId, sessionId),
        eq(momentCompletions.userId, userId)
      ))
      .limit(1);

    if (!completion) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get moment
    const [moment] = await db
      .select()
      .from(managerMoments)
      .where(eq(managerMoments.id, momentId))
      .limit(1);

    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }

    // Get moment template for category
    const template = momentsAIService.getMomentTemplate(momentId);
    const category = template?.cluster || moment.category || 'Communication';

    // Get previous sessions for context
    const previousSessions = await db
      .select()
      .from(userMomentFeedback)
      .where(
        sql`${userMomentFeedback.userId} = ${userId} AND ${userMomentFeedback.category} = ${category}`
      )
      .orderBy(desc(userMomentFeedback.createdAt))
      .limit(3);

    // Generate coaching feedback
    const transcript = (completion.transcript as any[]) || [];
    const feedback = await conversationalCoachingService.generateCoachingFeedback(
      momentId,
      {
        transcript,
        turnCount: completion.turnCount || 0,
        momentId,
        category,
        previousSessions: previousSessions.map(s => ({
          score: s.score || 0,
          feedback: s.feedback,
          date: s.createdAt,
        })),
      }
    );

    // Save feedback to database
    const [savedFeedback] = await db
      .insert(userMomentFeedback)
      .values({
        userId,
        momentId,
        completionId: completion.id,
        rubric: feedback.rubric,
        feedback: feedback.feedback,
        managerTone: feedback.managerTone,
        category,
        score: feedback.score,
        xpEarned: feedback.xpEarned,
      })
      .returning();

    // Award XP
    const xpUpdate = await badgeService.awardXP(userId, feedback.xpEarned, category);

    // Check for badges
    const badgeChecks = await badgeService.checkAndAwardBadges(userId, category, feedback.score);
    const newBadges = badgeChecks.filter(b => b.earned).map(b => b.badge);

    // Create insight for improvement
    const previousScore = previousSessions[0]?.score || null;
    if (previousScore !== null) {
      const insight = conversationalCoachingService.generateInsight(
        category,
        feedback.score,
        previousScore,
        previousSessions.length + 1
      );

      await db.insert(userInsightTimeline).values({
        userId,
        momentId,
        category,
        insightType: insight.type,
        title: insight.title,
        description: insight.description,
        metadata: { score: feedback.score, previousScore },
      });
    }

    // Save conversation memory (keep last 5 per category)
    const memoryCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversationMemory)
      .where(and(
        eq(conversationMemory.userId, userId),
        eq(conversationMemory.category, category)
      ));

    if (memoryCount[0].count >= 5) {
      // Delete oldest
      const oldest = await db
        .select()
        .from(conversationMemory)
        .where(and(
          eq(conversationMemory.userId, userId),
          eq(conversationMemory.category, category)
        ))
        .orderBy(conversationMemory.createdAt)
        .limit(1);

      if (oldest[0]) {
        await db
          .delete(conversationMemory)
          .where(eq(conversationMemory.id, oldest[0].id));
      }
    }

    await db.insert(conversationMemory).values({
      userId,
      category,
      momentId,
      sessionSummary: feedback.feedback.substring(0, 200),
      keyLearnings: feedback.strengths,
      score: feedback.score,
    });

    // Update completion status
    await db
      .update(momentCompletions)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(momentCompletions.id, completion.id));

    const duration = Date.now() - startTime;
    console.log(`[Coaching] Completed in ${duration}ms`);

    res.json({
      success: true,
      feedback: {
        ...feedback,
        feedbackId: savedFeedback.id,
      },
      xp: xpUpdate,
      badges: newBadges,
      duration,
    });
  } catch (error: any) {
    console.error('[Coaching] Error:', error);
    res.status(500).json({
      error: 'Failed to generate coaching feedback',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/progress
 * Get user's overall progress, XP, badges, and insights
 */
router.get('/progress', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  try {
    // Get XP and level
    const xpData = await badgeService.getUserXP(userId);

    // Get badges
    const badgeProgress = await badgeService.getUserBadgeProgress(userId);

    // Get recent insights
    const insights = await db
      .select()
      .from(userInsightTimeline)
      .where(eq(userInsightTimeline.userId, userId))
      .orderBy(desc(userInsightTimeline.createdAt))
      .limit(10);

    // Get feedback history
    const feedbackHistory = await db
      .select()
      .from(userMomentFeedback)
      .where(eq(userMomentFeedback.userId, userId))
      .orderBy(desc(userMomentFeedback.createdAt))
      .limit(20);

    // Calculate category-wise stats
    const categoryStats: Record<string, any> = {};
    feedbackHistory.forEach(f => {
      if (!categoryStats[f.category]) {
        categoryStats[f.category] = {
          category: f.category,
          completions: 0,
          averageScore: 0,
          totalScore: 0,
          xpEarned: 0,
        };
      }
      categoryStats[f.category].completions++;
      categoryStats[f.category].totalScore += f.score;
      categoryStats[f.category].xpEarned += f.xpEarned;
    });

    Object.values(categoryStats).forEach((stat: any) => {
      stat.averageScore = Math.round(stat.totalScore / stat.completions);
    });

    res.json({
      success: true,
      xp: xpData,
      badges: badgeProgress,
      insights,
      categoryStats: Object.values(categoryStats),
      recentFeedback: feedbackHistory.slice(0, 5),
    });
  } catch (error) {
    console.error('[Progress] Error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

/**
 * GET /api/insights/moments
 * Get aggregated insights and analytics for moments
 */
router.get('/insights/moments', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { category, timeRange = '30' } = req.query;

  try {
    const daysAgo = parseInt(timeRange as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get feedback in time range
    const feedback = category
      ? await db
          .select()
          .from(userMomentFeedback)
          .where(
            sql`${userMomentFeedback.userId} = ${userId} AND ${userMomentFeedback.category} = ${category} AND ${userMomentFeedback.createdAt} >= ${startDate}`
          )
          .orderBy(desc(userMomentFeedback.createdAt))
      : await db
          .select()
          .from(userMomentFeedback)
          .where(
            sql`${userMomentFeedback.userId} = ${userId} AND ${userMomentFeedback.createdAt} >= ${startDate}`
          )
          .orderBy(desc(userMomentFeedback.createdAt));

    // Calculate trends
    const scoreHistory = feedback.map(f => ({
      date: f.createdAt,
      score: f.score,
      category: f.category,
    }));

    // Calculate average by category
    const categoryAverages: Record<string, { total: number; count: number; avg: number }> = {};
    feedback.forEach(f => {
      if (!categoryAverages[f.category]) {
        categoryAverages[f.category] = { total: 0, count: 0, avg: 0 };
      }
      categoryAverages[f.category].total += f.score;
      categoryAverages[f.category].count++;
    });

    Object.keys(categoryAverages).forEach(cat => {
      categoryAverages[cat].avg = Math.round(
        categoryAverages[cat].total / categoryAverages[cat].count
      );
    });

    // Identify top strengths and weak areas
    const rubricScores: Record<string, number[]> = {};
    feedback.forEach(f => {
      const rubric = f.rubric as any;
      Object.entries(rubric).forEach(([key, value]) => {
        if (!rubricScores[key]) rubricScores[key] = [];
        rubricScores[key].push(typeof value === 'boolean' ? (value ? 1 : 0) : (value as number));
      });
    });

    const rubricAverages = Object.entries(rubricScores).map(([key, scores]) => ({
      criterion: key,
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      count: scores.length,
    }));

    const topStrengths = rubricAverages
      .filter(r => r.average >= 0.8)
      .sort((a, b) => b.average - a.average)
      .slice(0, 3);

    const weakAreas = rubricAverages
      .filter(r => r.average < 0.6)
      .sort((a, b) => a.average - b.average)
      .slice(0, 3);

    res.json({
      success: true,
      timeRange: daysAgo,
      totalCompletions: feedback.length,
      scoreHistory,
      categoryAverages,
      topStrengths,
      weakAreas,
      recentFeedback: feedback.slice(0, 5),
    });
  } catch (error) {
    console.error('[Insights] Error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

/**
 * GET /api/badges
 * Get user's badges and progress
 */
router.get('/badges', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { category } = req.query;

  try {
    const badgeProgress = await badgeService.getUserBadgeProgress(
      userId,
      category as string | undefined
    );

    res.json({
      success: true,
      ...badgeProgress,
    });
  } catch (error) {
    console.error('[Badges] Error:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

/**
 * GET /api/insights/timeline
 * Get user's insight timeline
 */
router.get('/insights/timeline', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { limit = '20' } = req.query;

  try {
    const insights = await db
      .select()
      .from(userInsightTimeline)
      .where(eq(userInsightTimeline.userId, userId))
      .orderBy(desc(userInsightTimeline.createdAt))
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error('[Timeline] Error:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

export default router;
