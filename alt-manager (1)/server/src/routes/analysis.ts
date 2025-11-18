import express from 'express';
import { db } from '../db/index.js';
import { 
  momRecords, 
  trendAnalysis, 
  blindspotAnalysis, 
  progressAnalysis,
  conversations,
  messages 
} from '../db/schema.js';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { analysisService } from '../services/analysis.service.js';
import { analyticsService } from '../services/analytics.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Generate MoM from conversation
router.post('/mom', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { conversationId, transcript, date } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    console.log('📝 Generating MoM for user:', userId);

    // Generate MoM using AI
    const momData = await analysisService.generateMoM({
      transcript,
      date: date || new Date().toLocaleDateString('en-GB'),
    });

    // Save to database
    const [newMom] = await db.insert(momRecords).values({
      userId,
      conversationId: conversationId || null,
      title: momData.title,
      date: new Date(momData.date.split('-').reverse().join('-')),
      summary: momData.summary,
      developmentAreas: momData.developmentAreas,
      emotionalTone: momData.emotionalTone,
      actionItems: momData.actionItems,
      insights: momData.insights,
      blindspots: momData.blindspots,
      rawTranscript: transcript,
    }).returning();

    console.log('✅ MoM created with ID:', newMom.id);

    res.status(201).json({
      success: true,
      mom: newMom,
    });
  } catch (error: any) {
    console.error('MoM generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate MoM',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get all MoMs for user
router.get('/moms', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    console.log(`[Analysis] Fetching MoMs for user: ${userId}`);

    // Set cache headers (5 minutes)
    res.set('Cache-Control', 'private, max-age=300');

    let moms;
    try {
      moms = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.userId, userId))
        .orderBy(desc(momRecords.date))
        .limit(limit)
        .offset(offset);
    } catch (dbError: any) {
      console.error('[Analysis] Database error fetching MoMs:', dbError);
      // Return empty array if table doesn't exist
      if (dbError.message?.includes('does not exist') || dbError.code === '42P01') {
        console.warn('[Analysis] mom_records table does not exist, returning empty array');
        return res.json({ success: true, moms: [], count: 0 });
      }
      throw dbError;
    }

    console.log(`[Analysis] Found ${moms.length} MoMs`);
    res.json({
      success: true,
      moms,
      count: moms.length,
    });
  } catch (error: any) {
    console.error('[Analysis] Get MoMs error:', error);
    // Return empty state instead of 500 error
    res.json({ 
      success: true,
      moms: [],
      count: 0
    });
  }
});

// Get single MoM by ID
router.get('/moms/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const momId = parseInt(req.params.id);

    const [mom] = await db
      .select()
      .from(momRecords)
      .where(and(
        eq(momRecords.id, momId),
        eq(momRecords.userId, userId)
      ))
      .limit(1);

    if (!mom) {
      return res.status(404).json({ error: 'MoM not found' });
    }

    res.json({
      success: true,
      mom,
    });
  } catch (error: any) {
    console.error('Get MoM error:', error);
    res.status(500).json({ error: 'Failed to fetch MoM' });
  }
});

// Generate trend analysis
router.post('/trends', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { momIds } = req.body;

    console.log('📊 Generating trend analysis for user:', userId);

    // Fetch MoMs
    let moms;
    if (momIds && momIds.length > 0) {
      moms = await db
        .select()
        .from(momRecords)
        .where(and(
          eq(momRecords.userId, userId),
          inArray(momRecords.id, momIds)
        ))
        .orderBy(momRecords.date);
    } else {
      // Get all MoMs for user
      moms = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.userId, userId))
        .orderBy(momRecords.date);
    }

    console.log(`[Trends Analysis] Found ${moms.length} MoMs for user ${userId}`);

    if (moms.length === 0) {
      return res.status(400).json({ 
        error: 'No conversation data available',
        message: 'Please have at least one conversation with ALT Manager to generate trends analysis.',
        requiresData: true
      });
    }

    if (moms.length < 1) {
      return res.status(400).json({ 
        error: 'Insufficient data for trends analysis',
        message: 'Trends analysis requires at least 1 conversation session.',
        requiresData: true,
        currentCount: moms.length,
        requiredCount: 1
      });
    }

    // Prepare data for analysis
    const momData = moms.map(m => ({
      date: m.date.toLocaleDateString('en-GB'),
      developmentAreas: m.developmentAreas as string[],
      emotionalTone: m.emotionalTone || '',
      summary: m.summary,
    }));

    // Generate trend analysis
    console.log('[Trends Analysis] Calling AI service...');
    let trends;
    try {
      trends = await analysisService.analyzeTrends({ momRecords: momData });
      console.log('[Trends Analysis] AI analysis completed successfully');
    } catch (aiError: any) {
      console.error('[Trends Analysis] AI service error:', aiError.message);
      return res.status(503).json({ 
        error: 'AI service temporarily unavailable',
        message: 'Unable to generate trends analysis at this time. Please try again in a few moments.',
        details: process.env.NODE_ENV === 'development' ? aiError.message : undefined,
      });
    }

    // Validate AI response
    if (!trends || !trends.primaryDevelopmentAreas || !trends.summaryInsights) {
      console.error('[Trends Analysis] Invalid AI response:', trends);
      return res.status(500).json({ 
        error: 'Invalid analysis generated',
        message: 'The analysis service returned incomplete data. Please try again.',
      });
    }

    // Save to database
    const [newTrend] = await db.insert(trendAnalysis).values({
      userId,
      primaryDevelopmentAreas: trends.primaryDevelopmentAreas,
      contentThemeClusters: trends.contentThemeClusters,
      emotionalTrajectory: trends.emotionalTrajectory,
      summaryInsights: trends.summaryInsights,
      momCount: moms.length,
      dateRange: {
        start: moms[0].date.toISOString(),
        end: moms[moms.length - 1].date.toISOString(),
      },
    }).returning();

    console.log('✅ Trend analysis created with ID:', newTrend.id);

    res.status(201).json({
      success: true,
      analysis: newTrend,
    });
  } catch (error: any) {
    console.error('[Trends Analysis] Unexpected error:', error);
    console.error('[Trends Analysis] Error stack:', error.stack);
    console.error('[Trends Analysis] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ 
      error: 'Failed to generate trend analysis',
      message: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Get latest trend analysis
router.get('/trends/latest', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const [latest] = await db
      .select()
      .from(trendAnalysis)
      .where(eq(trendAnalysis.userId, userId))
      .orderBy(desc(trendAnalysis.analysisDate))
      .limit(1);

    if (!latest) {
      return res.status(404).json({ error: 'No trend analysis found' });
    }

    res.json({
      success: true,
      analysis: latest,
    });
  } catch (error: any) {
    console.error('Get trend analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch trend analysis' });
  }
});

// Generate blindspot analysis
router.post('/blindspots', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { momIds } = req.body;

    console.log('🔍 Generating blindspot analysis for user:', userId);

    // Fetch MoMs
    let moms;
    if (momIds && momIds.length > 0) {
      moms = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.userId, userId))
        .orderBy(momRecords.date);
    } else {
      moms = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.userId, userId))
        .orderBy(momRecords.date);
    }

    console.log(`[Blindspots Analysis] Found ${moms.length} MoMs for user ${userId}`);

    if (moms.length === 0) {
      return res.status(400).json({ 
        error: 'No conversation data available',
        message: 'Please have at least one conversation with ALT Manager to generate blindspots analysis.',
        requiresData: true
      });
    }

    if (moms.length < 1) {
      return res.status(400).json({ 
        error: 'Insufficient data for blindspots analysis',
        message: 'Blindspots analysis requires at least 1 conversation session.',
        requiresData: true,
        currentCount: moms.length,
        requiredCount: 1
      });
    }

    // Prepare data for analysis
    const momData = moms.map(m => ({
      date: m.date.toLocaleDateString('en-GB'),
      blindspots: m.blindspots as string[],
      actionItems: m.actionItems as string[],
      developmentAreas: m.developmentAreas as string[],
      summary: m.summary,
    }));

    // Generate blindspot analysis
    console.log('[Blindspots Analysis] Calling AI service...');
    let blindspots;
    try {
      blindspots = await analysisService.analyzeBlindspots({ momRecords: momData });
      console.log('[Blindspots Analysis] AI analysis completed successfully');
    } catch (aiError: any) {
      console.error('[Blindspots Analysis] AI service error:', aiError.message);
      return res.status(503).json({ 
        error: 'AI service temporarily unavailable',
        message: 'Unable to generate blindspots analysis at this time. Please try again in a few moments.',
        details: process.env.NODE_ENV === 'development' ? aiError.message : undefined,
      });
    }

    // Validate AI response
    if (!blindspots || !blindspots.recurringBlindspots || !blindspots.developmentHypotheses) {
      console.error('[Blindspots Analysis] Invalid AI response:', blindspots);
      return res.status(500).json({ 
        error: 'Invalid analysis generated',
        message: 'The analysis service returned incomplete data. Please try again.',
      });
    }

    // Save to database
    const [newAnalysis] = await db.insert(blindspotAnalysis).values({
      userId,
      recurringBlindspots: blindspots.recurringBlindspots,
      whatRemainsUnsaid: blindspots.whatRemainsUnsaid,
      operatingAssumptions: blindspots.operatingAssumptions,
      unrecognizedStrengths: blindspots.unrecognizedStrengths,
      growthBlockers: blindspots.growthBlockers,
      metaPatterns: blindspots.metaPatterns,
      developmentHypotheses: blindspots.developmentHypotheses,
      momCount: moms.length,
      dateRange: {
        start: moms[0].date.toISOString(),
        end: moms[moms.length - 1].date.toISOString(),
      },
    }).returning();

    console.log('✅ Blindspot analysis created with ID:', newAnalysis.id);

    res.status(201).json({
      success: true,
      analysis: newAnalysis,
    });
  } catch (error: any) {
    console.error('[Blindspots Analysis] Unexpected error:', error);
    console.error('[Blindspots Analysis] Error stack:', error.stack);
    console.error('[Blindspots Analysis] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ 
      error: 'Failed to generate blindspot analysis',
      message: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Get latest blindspot analysis
router.get('/blindspots/latest', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const [latest] = await db
      .select()
      .from(blindspotAnalysis)
      .where(eq(blindspotAnalysis.userId, userId))
      .orderBy(desc(blindspotAnalysis.analysisDate))
      .limit(1);

    if (!latest) {
      return res.status(404).json({ error: 'No blindspot analysis found' });
    }

    res.json({
      success: true,
      analysis: latest,
    });
  } catch (error: any) {
    console.error('Get blindspot analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch blindspot analysis' });
  }
});

// Generate progress analysis
router.post('/progress', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { momIds } = req.body;

    console.log('📈 Generating progress analysis for user:', userId);

    // Fetch MoMs
    let moms;
    if (momIds && momIds.length > 0) {
      moms = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.userId, userId))
        .orderBy(momRecords.date);
    } else {
      moms = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.userId, userId))
        .orderBy(momRecords.date);
    }

    console.log(`[Progress Analysis] Found ${moms.length} MoMs for user ${userId}`);

    if (moms.length === 0) {
      return res.status(400).json({ 
        error: 'No conversation data available',
        message: 'Please have at least one conversation with ALT Manager to generate progress analysis.',
        requiresData: true
      });
    }

    if (moms.length < 1) {
      return res.status(400).json({ 
        error: 'Insufficient data for progress analysis',
        message: 'Progress analysis requires at least 1 conversation session.',
        requiresData: true,
        currentCount: moms.length,
        requiredCount: 1
      });
    }

    // Prepare data for analysis
    const momData = moms.map(m => ({
      date: m.date.toLocaleDateString('en-GB'),
      developmentAreas: m.developmentAreas as string[],
      actionItems: m.actionItems as string[],
      emotionalTone: m.emotionalTone || '',
      insights: m.insights as string[],
      summary: m.summary,
    }));

    // Generate progress analysis
    console.log('[Progress Analysis] Calling AI service...');
    let progress;
    try {
      progress = await analysisService.analyzeProgress({ momRecords: momData });
      console.log('[Progress Analysis] AI analysis completed successfully');
    } catch (aiError: any) {
      console.error('[Progress Analysis] AI service error:', aiError.message);
      return res.status(503).json({ 
        error: 'AI service temporarily unavailable',
        message: 'Unable to generate progress analysis at this time. Please try again in a few moments.',
        details: process.env.NODE_ENV === 'development' ? aiError.message : undefined,
      });
    }

    // Validate AI response
    if (!progress || !progress.keyThemes || !progress.progressScores) {
      console.error('[Progress Analysis] Invalid AI response:', progress);
      return res.status(500).json({ 
        error: 'Invalid analysis generated',
        message: 'The analysis service returned incomplete data. Please try again.',
      });
    }

    // Save to database
    const [newAnalysis] = await db.insert(progressAnalysis).values({
      userId,
      keyThemes: progress.keyThemes,
      movementOnAreas: [],
      actionItemEvolution: [],
      mindsetShifts: [],
      capabilityBuilding: [],
      smallWins: [],
      stuckPoints: [],
      overallTrajectory: progress.overallTrajectory,
      progressScores: progress.progressScores,
      momCount: moms.length,
      dateRange: {
        start: moms[0].date.toISOString(),
        end: moms[moms.length - 1].date.toISOString(),
      },
    }).returning();

    console.log('✅ Progress analysis created with ID:', newAnalysis.id);

    res.status(201).json({
      success: true,
      analysis: newAnalysis,
    });
  } catch (error: any) {
    console.error('[Progress Analysis] Unexpected error:', error);
    console.error('[Progress Analysis] Error stack:', error.stack);
    console.error('[Progress Analysis] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ 
      error: 'Failed to generate progress analysis',
      message: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Get latest progress analysis
router.get('/progress/latest', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const [latest] = await db
      .select()
      .from(progressAnalysis)
      .where(eq(progressAnalysis.userId, userId))
      .orderBy(desc(progressAnalysis.analysisDate))
      .limit(1);

    if (!latest) {
      return res.status(404).json({ error: 'No progress analysis found' });
    }

    res.json({
      success: true,
      analysis: latest,
    });
  } catch (error: any) {
    console.error('Get progress analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch progress analysis' });
  }
});

// Get analytics dashboard summary
router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    console.log(`[Analysis] Fetching dashboard for user: ${userId}`);

    // Set cache headers (5 minutes)
    res.set('Cache-Control', 'private, max-age=300');

    let latestTrend, latestBlindspot, latestProgress, moms;

    // Fetch with error handling for each table
    try {
      [latestTrend] = await db
        .select()
        .from(trendAnalysis)
        .where(eq(trendAnalysis.userId, userId))
        .orderBy(desc(trendAnalysis.analysisDate))
        .limit(1);
    } catch (err: any) {
      console.warn('[Analysis] trend_analysis table error:', err.message);
      latestTrend = null;
    }

    try {
      [latestBlindspot] = await db
        .select()
        .from(blindspotAnalysis)
        .where(eq(blindspotAnalysis.userId, userId))
        .orderBy(desc(blindspotAnalysis.analysisDate))
        .limit(1);
    } catch (err: any) {
      console.warn('[Analysis] blindspot_analysis table error:', err.message);
      latestBlindspot = null;
    }

    try {
      [latestProgress] = await db
        .select()
        .from(progressAnalysis)
        .where(eq(progressAnalysis.userId, userId))
        .orderBy(desc(progressAnalysis.analysisDate))
        .limit(1);
    } catch (err: any) {
      console.warn('[Analysis] progress_analysis table error:', err.message);
      latestProgress = null;
    }

    // Get MoM count
    try {
      moms = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.userId, userId));
    } catch (err: any) {
      console.warn('[Analysis] mom_records table error:', err.message);
      moms = [];
    }

    console.log(`[Analysis] Dashboard: ${moms.length} MoMs, trend: ${!!latestTrend}, blindspot: ${!!latestBlindspot}, progress: ${!!latestProgress}`);

    res.json({
      success: true,
      dashboard: {
        momCount: moms.length,
        latestTrend: latestTrend || null,
        latestBlindspot: latestBlindspot || null,
        latestProgress: latestProgress || null,
        hasData: moms.length > 0,
      },
    });
  } catch (error: any) {
    console.error('[Analysis] Dashboard error:', error);
    // Return empty state instead of 500 error
    res.json({
      success: true,
      dashboard: {
        momCount: 0,
        latestTrend: null,
        latestBlindspot: null,
        latestProgress: null,
        hasData: false,
      },
    });
  }
});

// Generate comprehensive analytics for user
router.post('/analytics/generate', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    console.log(`[Analysis] Generating comprehensive analytics for user: ${userId}`);

    const analytics = await analyticsService.generateUserAnalytics(userId);

    res.json({
      success: true,
      message: 'Analytics generated successfully',
      analytics,
    });
  } catch (error: any) {
    console.error('[Analysis] Analytics generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate analytics',
      details: error.message,
    });
  }
});

// Get latest analytics for user
router.get('/analytics', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    console.log(`[Analysis] Fetching analytics for user: ${userId}`);

    const analytics = await analyticsService.getUserAnalytics(userId);

    res.json({
      success: true,
      analytics,
    });
  } catch (error: any) {
    console.error('[Analysis] Get analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      details: error.message,
    });
  }
});

export default router;
