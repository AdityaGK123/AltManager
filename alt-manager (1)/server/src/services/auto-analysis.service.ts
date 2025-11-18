import { db } from '../db/index.js';
import { momRecords, trendAnalysis, blindspotAnalysis } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { analysisService } from './analysis.service.js';

/**
 * Auto Analysis Service - Automatically generates Themes & Trends and Blindspots analysis
 * Triggers after MoM creation when sufficient data is available
 */
export class AutoAnalysisService {
  private readonly MIN_MOMS_FOR_TRENDS = 1;
  private readonly MIN_MOMS_FOR_BLINDSPOTS = 1;
  private readonly ANALYSIS_COOLDOWN_HOURS = 1; // Regenerate after 1 hour for testing

  /**
   * Check if enough time has passed since last analysis
   */
  private async shouldRegenerateAnalysis(
    userId: number,
    analysisType: 'trends' | 'blindspots'
  ): Promise<boolean> {
    try {
      const table = analysisType === 'trends' ? trendAnalysis : blindspotAnalysis;
      const [latest] = await db
        .select()
        .from(table)
        .where(eq(table.userId, userId))
        .orderBy(desc(table.analysisDate))
        .limit(1);

      if (!latest) return true; // No analysis exists yet

      const hoursSinceLastAnalysis =
        (Date.now() - new Date(latest.analysisDate).getTime()) / (1000 * 60 * 60);

      return hoursSinceLastAnalysis >= this.ANALYSIS_COOLDOWN_HOURS;
    } catch (error) {
      console.error(`[Auto Analysis] Error checking cooldown for ${analysisType}:`, error);
      return false; // Don't regenerate if we can't check
    }
  }

  /**
   * Get all MoMs for analysis
   */
  private async getMoMsForAnalysis(userId: number): Promise<any[]> {
    try {
      const moms = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.userId, userId))
        .orderBy(momRecords.date);

      return moms;
    } catch (error) {
      console.error('[Auto Analysis] Error fetching MoMs:', error);
      return [];
    }
  }

  /**
   * Auto-generate Themes & Trends analysis
   */
  private async autoGenerateTrends(userId: number): Promise<void> {
    try {
      console.log(`[Auto Analysis] Checking if Trends analysis should be generated for user ${userId}`);

      // Check cooldown
      if (!(await this.shouldRegenerateAnalysis(userId, 'trends'))) {
        console.log('[Auto Analysis] Trends analysis cooldown active, skipping');
        return;
      }

      // Get MoMs
      const moms = await this.getMoMsForAnalysis(userId);

      if (moms.length < this.MIN_MOMS_FOR_TRENDS) {
        console.log(`[Auto Analysis] Not enough MoMs for trends (${moms.length}/${this.MIN_MOMS_FOR_TRENDS})`);
        return;
      }

      console.log(`[Auto Analysis] Generating Trends analysis with ${moms.length} MoMs...`);

      // Prepare data
      const momData = moms.map(m => ({
        date: m.date.toLocaleDateString('en-GB'),
        developmentAreas: m.developmentAreas as string[],
        emotionalTone: m.emotionalTone || '',
        summary: m.summary,
      }));

      // Generate analysis
      const trends = await analysisService.analyzeTrends({ momRecords: momData });

      // Save to database
      await db.insert(trendAnalysis).values({
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
      });

      console.log('[Auto Analysis] ✅ Trends analysis generated successfully');
    } catch (error) {
      console.error('[Auto Analysis] ❌ Error generating trends:', error);
      // Don't throw - analysis failure shouldn't break the flow
    }
  }

  /**
   * Auto-generate Blindspots analysis
   */
  private async autoGenerateBlindspots(userId: number): Promise<void> {
    try {
      console.log(`[Auto Analysis] Checking if Blindspots analysis should be generated for user ${userId}`);

      // Check cooldown
      if (!(await this.shouldRegenerateAnalysis(userId, 'blindspots'))) {
        console.log('[Auto Analysis] Blindspots analysis cooldown active, skipping');
        return;
      }

      // Get MoMs
      const moms = await this.getMoMsForAnalysis(userId);

      if (moms.length < this.MIN_MOMS_FOR_BLINDSPOTS) {
        console.log(`[Auto Analysis] Not enough MoMs for blindspots (${moms.length}/${this.MIN_MOMS_FOR_BLINDSPOTS})`);
        return;
      }

      console.log(`[Auto Analysis] Generating Blindspots analysis with ${moms.length} MoMs...`);

      // Prepare data
      const momData = moms.map(m => ({
        date: m.date.toLocaleDateString('en-GB'),
        blindspots: m.blindspots as string[],
        actionItems: m.actionItems as string[],
        developmentAreas: m.developmentAreas as string[],
        summary: m.summary,
      }));

      // Generate analysis
      const blindspots = await analysisService.analyzeBlindspots({ momRecords: momData });

      // Save to database
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
        dateRange: {
          start: moms[0].date.toISOString(),
          end: moms[moms.length - 1].date.toISOString(),
        },
      });

      console.log('[Auto Analysis] ✅ Blindspots analysis generated successfully');
    } catch (error) {
      console.error('[Auto Analysis] ❌ Error generating blindspots:', error);
      // Don't throw - analysis failure shouldn't break the flow
    }
  }

  /**
   * Main entry point - triggers after MoM creation
   * Generates both Trends and Blindspots analysis if conditions are met
   */
  async triggerAutoAnalysis(userId: number): Promise<void> {
    try {
      console.log(`[Auto Analysis] 🚀 Triggered for user ${userId}`);

      // Run both analyses in parallel (non-blocking)
      await Promise.allSettled([
        this.autoGenerateTrends(userId),
        this.autoGenerateBlindspots(userId),
      ]);

      console.log('[Auto Analysis] ✅ Auto-analysis check completed');
    } catch (error) {
      console.error('[Auto Analysis] ❌ Unexpected error:', error);
      // Don't throw - this is a background process
    }
  }
}

// Export singleton instance
export const autoAnalysisService = new AutoAnalysisService();
