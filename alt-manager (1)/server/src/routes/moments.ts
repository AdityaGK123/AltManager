import { Router } from 'express';
import express from 'express';
import { db } from '../db/index.js';
import { 
  managerMoments, 
  momentCompletions, 
  momentDebriefs, 
  momentPeerExamples, 
  userMoments 
} from '../db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { momentsAIService } from '../services/momentsAIService.js';
import { logMomentDiagnostic } from '../services/diagnostics.service.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all manager moments with metadata
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const moments = await db.select().from(managerMoments);
    
    if (!moments || moments.length === 0) {
      return res.json({ moments: [] });
    }
    
    // Enrich with user progress (safe fallback if user_moments doesn't exist)
    const userId = req.userId!;
    let userProgress: any[] = [];
    
    try {
      userProgress = await db
        .select()
        .from(userMoments)
        .where(eq(userMoments.userId, userId));
    } catch (progressError) {
      console.warn('User progress fetch failed, continuing without progress data:', progressError);
    }
    
    const enriched = moments.map(m => ({
      ...m,
      userProgress: userProgress.find(up => up.momentId === m.id) || {
        status: 'not_started',
        score: null,
        attempts: 0,
        lastPracticedAt: null
      }
    }));
    
    res.json({ moments: enriched });
  } catch (error) {
    console.error('Get moments error:', error);
    res.status(500).json({ error: 'Failed to fetch moments' });
  }
});

// Get user's moment progress
router.get('/progress', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const progress = await db
      .select()
      .from(userMoments)
      .where(eq(userMoments.userId, req.userId!));

    res.json({ progress });
  } catch (error) {
    console.error('Get moment progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get comprehensive analytics for progress dashboard
router.get('/analytics', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    // Get all user moments with completion data
    const userProgress = await db
      .select()
      .from(userMoments)
      .where(eq(userMoments.userId, userId));
    
    // Get all moments for category mapping
    const allMoments = await db.select().from(managerMoments);
    
    // Get all debriefs for detailed scoring
    const debriefs = await db
      .select()
      .from(momentDebriefs)
      .where(eq(momentDebriefs.userId, userId))
      .orderBy(desc(momentDebriefs.createdAt));
    
    // Calculate category-based statistics
    const categoryStats: Record<string, {
      completedMoments: number;
      totalScore: number;
      count: number;
      avgScore: number;
      moments: string[];
    }> = {};
    
    userProgress.forEach(up => {
      const moment = allMoments.find(m => m.id === up.momentId);
      if (!moment) return;
      
      const category = (moment as any).cluster || moment.category || 'Other';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          completedMoments: 0,
          totalScore: 0,
          count: 0,
          avgScore: 0,
          moments: []
        };
      }
      
      categoryStats[category].completedMoments++;
      categoryStats[category].totalScore += up.score || 0;
      categoryStats[category].count++;
      categoryStats[category].moments.push(moment.title);
    });
    
    // Calculate averages
    Object.keys(categoryStats).forEach(cat => {
      const stats = categoryStats[cat];
      stats.avgScore = stats.count > 0 ? stats.totalScore / stats.count : 0;
    });
    
    // Calculate progress over time
    const progressHistory = debriefs.map(d => ({
      date: d.createdAt,
      score: d.score,
      momentId: d.momentId
    })).reverse();
    
    // Calculate overall stats
    const totalCompleted = userProgress.length;
    const totalScore = userProgress.reduce((sum, up) => sum + (up.score || 0), 0);
    const avgScore = totalCompleted > 0 ? totalScore / totalCompleted : 0;
    
    // Calculate streak (consecutive days with activity)
    const sortedDates = debriefs
      .map(d => new Date(d.createdAt).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (sortedDates.length > 0) {
      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }
    
    // Top performing category
    const topCategory = Object.entries(categoryStats)
      .sort((a, b) => b[1].avgScore - a[1].avgScore)[0];
    
    res.json({
      success: true,
      analytics: {
        totalCompleted,
        avgScore: Math.round(avgScore * 10) / 10,
        streak,
        topCategory: topCategory ? {
          name: topCategory[0],
          avgScore: Math.round(topCategory[1].avgScore * 10) / 10
        } : null,
        categoryStats: Object.entries(categoryStats).map(([name, stats]) => ({
          category: name,
          completedMoments: stats.completedMoments,
          avgScore: Math.round(stats.avgScore * 10) / 10,
          moments: stats.moments
        })),
        progressHistory: progressHistory.slice(-20), // Last 20 entries
        recentDebriefs: debriefs.slice(0, 5).map(d => ({
          momentId: d.momentId,
          score: d.score,
          date: d.createdAt,
          strengths: d.strengths,
          improvements: d.improvements
        }))
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Start a manager moment - returns caselet + safety framing + roleplay config
router.post('/:id/start', authenticateToken, async (req: AuthRequest, res) => {
  const startTime = Date.now();
  const momentId = req.params.id; // String ID or slug
  const userId = req.userId!;
  
  try {
    console.log(`[Moments] Starting moment: ${momentId} for user: ${userId}`);

    // Get moment - try by ID first, then by slug (case-insensitive)
    let moment;
    try {
      const [foundById] = await db
        .select()
        .from(managerMoments)
        .where(eq(managerMoments.id, momentId))
        .limit(1);
      
      if (foundById) {
        moment = foundById;
      } else {
        // Try finding by slug pattern (convert slug to potential ID)
        const allMoments = await db.select().from(managerMoments);
        moment = allMoments.find(m => 
          m.id.toLowerCase() === momentId.toLowerCase() ||
          m.id.toLowerCase().replace(/_/g, '-') === momentId.toLowerCase() ||
          m.id.toLowerCase().replace(/-/g, '_') === momentId.toLowerCase()
        );
      }
    } catch (dbError) {
      console.error('[Moments] Database error:', dbError);
      return res.status(500).json({ error: 'Database error', details: 'Failed to query moments table' });
    }

    if (!moment) {
      console.warn(`[Moments] Moment not found: ${momentId}`);
      return res.status(404).json({ error: 'Moment not found', momentId });
    }

    console.log(`[Moments] Found moment: ${moment.id}`);

    // Get moment template from AI service
    let template;
    try {
      template = momentsAIService.getMomentTemplate(moment.id);
      if (!template) {
        console.warn(`[Moments] Template not found for: ${moment.id}`);
        return res.status(400).json({ error: 'Moment configuration not found', momentId: moment.id });
      }
    } catch (templateError) {
      console.error('[Moments] Template error:', templateError);
      return res.status(500).json({ error: 'Failed to load moment template' });
    }

    // Create new completion session
    const sessionId = uuidv4();
    let completion;
    try {
      [completion] = await db.insert(momentCompletions).values({
        userId,
        momentId: moment.id,
        sessionId,
        turnCount: 0,
        transcript: [],
        status: 'in_progress'
      }).returning();
      console.log(`[Moments] Created session: ${sessionId}`);
    } catch (insertError) {
      console.error('[Moments] Failed to create completion:', insertError);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Select random stakeholder variant
    const randomVariant = template.stakeholderVariants[
      Math.floor(Math.random() * template.stakeholderVariants.length)
    ];

    // Log successful diagnostic
    const duration = Date.now() - startTime;
    await logMomentDiagnostic({
      slug: momentId,
      endpoint: '/api/moments/:id/start',
      status: 'success',
      durationMs: duration,
      userId,
      metadata: { sessionId, momentId: moment.id },
    });
    
    console.log(`[Moments] Started successfully in ${duration}ms`);
    
    res.json({
      success: true,
      sessionId,
      completionId: completion.id,
      cluster: template.cluster,
      situation: template.situation,
      caselet: template.situation, // Add caselet alias for frontend compatibility
      safetyFraming: template.safetyFraming,
      stakeholderRole: randomVariant.role,
      stakeholderPrompt: randomVariant.prompt,
      expectedTurns: template.roleplayConfig.expectedTurns
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[Moments] Start moment error:', error);
    
    // Log error diagnostic
    await logMomentDiagnostic({
      slug: momentId,
      endpoint: '/api/moments/:id/start',
      status: 'error',
      durationMs: duration,
      errorMessage: error.message,
      userId,
      metadata: { stack: error.stack },
    });
    
    res.status(500).json({ 
      error: 'Failed to start moment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Submit user response and get AI roleplay reply + chips
router.post('/:id/response', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const momentId = req.params.id;
    const { sessionId, content } = req.body;
    const userId = req.userId!;

    if (!sessionId || !content) {
      return res.status(400).json({ error: 'sessionId and content required' });
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

    // Add user turn to transcript
    const transcript = (completion.transcript as any[]) || [];
    transcript.push({
      role: 'user',
      content,
      timestamp: new Date()
    });

    const turnCount = transcript.filter(t => t.role === 'user').length;

    // Get moment template to check expected turns
    const template = momentsAIService.getMomentTemplate(moment.id);
    if (!template) {
      console.warn(`[Moments] No template found for ${moment.id}, using defaults`);
    }
    const expectedTurns = template?.roleplayConfig?.expectedTurns || 3;
    
    // Get stakeholder role from template
    const stakeholderRole = template?.stakeholderVariants?.[0]?.role || 'Manager';
    
    console.log(`[Moments] Processing turn ${turnCount}/${expectedTurns} for ${moment.id}`);
    
    // Generate AI response
    const { reply, chips } = await momentsAIService.generateRoleplayResponse(
      moment.id,
      stakeholderRole,
      transcript,
      turnCount
    );

    // Add AI turn
    transcript.push({
      role: 'ai',
      content: reply,
      timestamp: new Date()
    });

    // Check if conversation is complete
    const isComplete = turnCount >= expectedTurns;

    // Update completion
    await db
      .update(momentCompletions)
      .set({
        transcript,
        turnCount,
        status: isComplete ? 'completed' : 'in_progress',
        updatedAt: new Date()
      })
      .where(eq(momentCompletions.id, completion.id));

    console.log(`[Moments] Turn ${turnCount}/${expectedTurns} - Complete: ${isComplete}`);

    res.json({
      success: true,
      reply,
      chips,
      turnCount,
      expectedTurns,
      isComplete
    });
  } catch (error) {
    console.error('Response error:', error);
    res.status(500).json({ error: 'Failed to process response' });
  }
});

// Generate debrief with rubric scoring
router.post('/:id/debrief', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const momentId = req.params.id;
    const { sessionId } = req.body;
    const userId = req.userId!;

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

    // Generate debrief using new AI service
    const transcript = (completion.transcript as any[]) || [];
    
    console.log(`[Moments] Generating debrief for ${moment.id}, transcript length: ${transcript.length}`);
    
    if (transcript.length === 0) {
      return res.status(400).json({ error: 'No transcript found. Complete the roleplay first.' });
    }
    
    const debrief = await momentsAIService.generateDebrief(moment.id, transcript);
    
    console.log(`[Moments] Debrief generated with score: ${debrief.score}`);

    // Save debrief with new structure
    const [savedDebrief] = await db.insert(momentDebriefs).values({
      completionId: completion.id,
      userId,
      momentId,
      score: debrief.score,
      evidenceQuotes: [],
      strengths: debrief.right,
      improvements: debrief.improve,
      exemplarRewrite: debrief.exemplarRewrite,
      microHabit: debrief.microHabit,
      templates: debrief.templates,
      rubricScores: debrief.rubricScores
    }).returning();

    // Update completion status
    await db
      .update(momentCompletions)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(momentCompletions.id, completion.id));

    // Update or create user moment record (UPSERT for efficiency)
    await db
      .insert(userMoments)
      .values({
        userId,
        momentId,
        status: 'completed',
        score: debrief.score,
        feedback: debrief,
        attempts: 1,
        lastPracticedAt: new Date(),
        completedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [userMoments.userId, userMoments.momentId],
        set: {
          status: 'completed',
          score: debrief.score,
          feedback: debrief,
          attempts: sql`${userMoments.attempts} + 1`,
          lastPracticedAt: new Date(),
          completedAt: new Date(),
          updatedAt: new Date()
        }
      });

    res.json({
      success: true,
      debrief: savedDebrief
    });
  } catch (error) {
    console.error('Debrief error:', error);
    res.status(500).json({ error: 'Failed to generate debrief' });
  }
});

// Create practice variant
router.post('/:id/practice', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const momentId = req.params.id;
    const { variantType = 'harder' } = req.body;

    // Get moment
    const [moment] = await db
      .select()
      .from(managerMoments)
      .where(eq(managerMoments.id, momentId))
      .limit(1);

    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }

    // Generate variant using new AI service
    const variant = await momentsAIService.generateVariant(
      moment.id,
      variantType
    );

    res.json({
      success: true,
      variant
    });
  } catch (error) {
    console.error('Practice variant error:', error);
    res.status(500).json({ error: 'Failed to generate practice variant' });
  }
});

// Evaluate rewrite in practice loop
router.post('/:id/rewrite', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const momentId = req.params.id;
    const { rewrite } = req.body;

    if (!rewrite) {
      return res.status(400).json({ error: 'rewrite required' });
    }

    // Evaluate rewrite
    const evaluation = momentsAIService.evaluateRewrite(momentId, rewrite);

    res.json({
      success: true,
      passed: evaluation.passed,
      score: evaluation.score,
      rubricScores: evaluation.rubricScores
    });
  } catch (error) {
    console.error('Rewrite evaluation error:', error);
    res.status(500).json({ error: 'Failed to evaluate rewrite' });
  }
});

// Get moment progress for user
router.get('/:id/progress', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const momentId = req.params.id;
    const userId = req.userId!;

    // Get all completions
    const completions = await db
      .select()
      .from(momentCompletions)
      .where(and(
        eq(momentCompletions.userId, userId),
        eq(momentCompletions.momentId, momentId)
      ))
      .orderBy(desc(momentCompletions.createdAt));

    // Get all debriefs
    const debriefs = await db
      .select()
      .from(momentDebriefs)
      .where(and(
        eq(momentDebriefs.userId, userId),
        eq(momentDebriefs.momentId, momentId)
      ))
      .orderBy(desc(momentDebriefs.createdAt));

    // Calculate score history
    const scoreHistory = debriefs.map(d => ({
      score: d.score,
      date: d.createdAt
    }));

    res.json({
      success: true,
      completions: completions.length,
      scoreHistory,
      latestScore: debriefs[0]?.score || null,
      averageScore: debriefs.length > 0
        ? debriefs.reduce((sum, d) => sum + d.score, 0) / debriefs.length
        : null
    });
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get peer examples
router.get('/:id/peer-examples', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const momentId = req.params.id;

    const examples = await db
      .select()
      .from(momentPeerExamples)
      .where(and(
        eq(momentPeerExamples.momentId, momentId),
        eq(momentPeerExamples.isApproved, true)
      ))
      .limit(5);

    res.json({
      success: true,
      examples
    });
  } catch (error) {
    console.error('Peer examples error:', error);
    res.status(500).json({ error: 'Failed to fetch peer examples' });
  }
});

export default router;
