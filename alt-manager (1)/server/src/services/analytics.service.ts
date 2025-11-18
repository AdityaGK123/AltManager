import { db } from '../db/index.js';
import { 
  momRecords, 
  trendAnalysis, 
  blindspotAnalysis, 
  progressAnalysis 
} from '../db/schema.js';
import { eq, desc, gte } from 'drizzle-orm';
import { analysisService } from './analysis.service.js';

/**
 * Analytics Service - Aggregates MoMs and generates insights
 * Runs scheduled analytics updates for users
 */
export class AnalyticsService {
  /**
   * Check if user has enough MoMs for meaningful analytics
   * Minimum: 3 MoMs
   */
  private async hasEnoughMoMs(userId: number): Promise<boolean> {
    const moms = await db
      .select()
      .from(momRecords)
      .where(eq(momRecords.userId, userId));
    
    return moms.length >= 3;
  }

  /**
   * Get recent MoMs for analysis (last 30 days or last 10 MoMs)
   */
  private async getRecentMoMs(userId: number): Promise<any[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const moms = await db
      .select()
      .from(momRecords)
      .where(eq(momRecords.userId, userId))
      .orderBy(desc(momRecords.date))
      .limit(10);

    return moms;
  }

  /**
   * Generate comprehensive analytics for a user
   * Includes: Trend Analysis, Blindspot Analysis, Progress Analysis
   */
  async generateUserAnalytics(userId: number): Promise<{
    trends: any;
    blindspots: any;
    progress: any;
  }> {
    try {
      console.log(`[Analytics] Generating analytics for user ${userId}`);

      // Check if user has enough MoMs
      if (!(await this.hasEnoughMoMs(userId))) {
        throw new Error('Not enough MoMs for analytics (minimum 3 required)');
      }

      // Get recent MoMs
      const moms = await this.getRecentMoMs(userId);
      console.log(`[Analytics] Analyzing ${moms.length} MoMs`);

      // Prepare data for trend analysis
      const trendInput = {
        momRecords: moms.map(mom => ({
          date: mom.date.toISOString(),
          developmentAreas: mom.developmentAreas as string[],
          emotionalTone: mom.emotionalTone || '',
          summary: mom.summary,
        })),
      };

      // Prepare data for blindspot analysis
      const blindspotInput = {
        momRecords: moms.map(mom => ({
          date: mom.date.toISOString(),
          blindspots: mom.blindspots as string[],
          actionItems: mom.actionItems as string[],
          developmentAreas: mom.developmentAreas as string[],
          summary: mom.summary,
        })),
      };

      // Prepare data for progress analysis
      const progressInput = {
        momRecords: moms.map(mom => ({
          date: mom.date.toISOString(),
          developmentAreas: mom.developmentAreas as string[],
          actionItems: mom.actionItems as string[],
          emotionalTone: mom.emotionalTone || '',
          insights: mom.insights as string[],
          summary: mom.summary,
        })),
      };

      // Generate all analyses in parallel
      console.log('[Analytics] Running AI analyses...');
      const [trends, blindspots, progress] = await Promise.all([
        analysisService.analyzeTrends(trendInput),
        analysisService.analyzeBlindspots(blindspotInput),
        analysisService.analyzeProgress(progressInput),
      ]);

      // Save to database
      const dateRange = {
        start: moms[moms.length - 1].date.toISOString(),
        end: moms[0].date.toISOString(),
      };

      // Save trend analysis
      await db.insert(trendAnalysis).values({
        userId,
        primaryDevelopmentAreas: trends.primaryDevelopmentAreas,
        contentThemeClusters: trends.contentThemeClusters,
        emotionalTrajectory: trends.emotionalTrajectory,
        summaryInsights: trends.summaryInsights,
        momCount: moms.length,
        dateRange,
      });

      // Save blindspot analysis
      await db.insert(blindspotAnalysis).values({
        userId,
        recurringBlindspots: blindspots.recurringBlindspots,
        whatRemainsUnsaid: blindspots.whatRemainsUnsaid,
        operatingAssumptions: blindspots.operatingAssumptions,
        unrecognizedStrengths: blindspots.unrecognizedStrengths,
        growthBlockers: blindspots.growthBlockers,
        metaPatterns: blindspots.metaPatterns,
        developmentHypotheses: blindspots.developmentHypotheses,
        momCount: moms.length,
        dateRange,
      });

      // Save progress analysis
      await db.insert(progressAnalysis).values({
        userId,
        keyThemes: progress.keyThemes,
        overallTrajectory: progress.overallTrajectory,
        progressScores: progress.progressScores,
        momCount: moms.length,
        dateRange,
      });

      console.log(`[Analytics] ✅ Analytics generated and saved for user ${userId}`);

      return {
        trends,
        blindspots,
        progress,
      };
    } catch (error) {
      console.error(`[Analytics] ❌ Error generating analytics for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get latest analytics for a user
   */
  async getUserAnalytics(userId: number): Promise<{
    trends: any | null;
    blindspots: any | null;
    progress: any | null;
    momCount: number;
  }> {
    try {
      // Get latest trend analysis
      const [latestTrends] = await db
        .select()
        .from(trendAnalysis)
        .where(eq(trendAnalysis.userId, userId))
        .orderBy(desc(trendAnalysis.analysisDate))
        .limit(1);

      // Get latest blindspot analysis
      const [latestBlindspots] = await db
        .select()
        .from(blindspotAnalysis)
        .where(eq(blindspotAnalysis.userId, userId))
        .orderBy(desc(blindspotAnalysis.analysisDate))
        .limit(1);

      // Get latest progress analysis
      const [latestProgress] = await db
        .select()
        .from(progressAnalysis)
        .where(eq(progressAnalysis.userId, userId))
        .orderBy(desc(progressAnalysis.analysisDate))
        .limit(1);

      // Get total MoM count
      const moms = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.userId, userId));

      return {
        trends: latestTrends || null,
        blindspots: latestBlindspots || null,
        progress: latestProgress || null,
        momCount: moms.length,
      };
    } catch (error) {
      console.error(`[Analytics] Error fetching analytics for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if analytics should be regenerated
   * Criteria: New MoMs since last analysis OR no analytics exist
   */
  async shouldRegenerateAnalytics(userId: number): Promise<boolean> {
    try {
      // Get latest analysis date
      const [latestAnalysis] = await db
        .select()
        .from(trendAnalysis)
        .where(eq(trendAnalysis.userId, userId))
        .orderBy(desc(trendAnalysis.analysisDate))
        .limit(1);

      if (!latestAnalysis) {
        // No analytics exist, check if user has enough MoMs
        return await this.hasEnoughMoMs(userId);
      }

      // Check if there are new MoMs since last analysis
      const newMoMs = await db
        .select()
        .from(momRecords)
        .where(
          eq(momRecords.userId, userId)
        );

      // Count MoMs created after last analysis
      const newMoMCount = newMoMs.filter(
        mom => mom.createdAt > latestAnalysis.analysisDate
      ).length;

      // Regenerate if there are 2+ new MoMs
      return newMoMCount >= 2;
    } catch (error) {
      console.error(`[Analytics] Error checking regeneration status:`, error);
      return false;
    }
  }

  /**
   * Auto-update analytics for a user (called after MoM generation)
   */
  async autoUpdateAnalytics(userId: number): Promise<void> {
    try {
      if (await this.shouldRegenerateAnalytics(userId)) {
        console.log(`[Analytics] Auto-updating analytics for user ${userId}`);
        await this.generateUserAnalytics(userId);
      } else {
        console.log(`[Analytics] No analytics update needed for user ${userId}`);
      }
    } catch (error) {
      console.error(`[Analytics] Error in auto-update:`, error);
      // Don't throw - analytics failure shouldn't break the flow
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
