import { db } from '../db/index.js';
import { momRecords, conversations, messages } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { analysisService } from './analysis.service.js';
import { analyticsService } from './analytics.service.js';
import { autoAnalysisService } from './auto-analysis.service.js';

/**
 * MoM Service - Handles automatic Minutes of Meeting generation
 * Triggers after conversations to create structured insights
 */
export class MomService {
  /**
   * Check if a conversation should trigger MoM generation
   * Criteria: At least 2 messages (1 exchange) to have meaningful content
   */
  private async shouldGenerateMoM(conversationId: number): Promise<boolean> {
    const messageCount = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId));
    
    return messageCount.length >= 2; // At least 1 user message + 1 AI response
  }

  /**
   * Check if MoM already exists for this conversation
   */
  private async momExists(conversationId: number): Promise<boolean> {
    const existing = await db
      .select()
      .from(momRecords)
      .where(eq(momRecords.conversationId, conversationId))
      .limit(1);
    
    return existing.length > 0;
  }

  /**
   * Build transcript from conversation messages
   */
  private async buildTranscript(conversationId: number): Promise<string> {
    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    let transcript = '';
    for (const msg of conversationMessages) {
      const speaker = msg.role === 'user' ? 'User' : 'Alt Manager';
      transcript += `${speaker}: ${msg.content}\n\n`;
    }

    return transcript.trim();
  }

  /**
   * Automatically generate MoM after a conversation reaches threshold
   * Called after each message is sent
   */
  async autoGenerateMoM(conversationId: number, userId: number): Promise<void> {
    try {
      console.log(`[MoM Service] Checking if MoM should be generated for conversation ${conversationId}`);

      // Check if MoM already exists
      if (await this.momExists(conversationId)) {
        console.log(`[MoM Service] MoM already exists for conversation ${conversationId}`);
        return;
      }

      // Check if conversation has enough messages
      if (!(await this.shouldGenerateMoM(conversationId))) {
        console.log(`[MoM Service] Conversation ${conversationId} doesn't have enough messages yet`);
        return;
      }

      console.log(`[MoM Service] Generating MoM for conversation ${conversationId}...`);

      // Build transcript
      const transcript = await this.buildTranscript(conversationId);

      // Generate MoM using AI
      const momData = await analysisService.generateMoM({
        transcript,
        date: new Date().toLocaleDateString('en-GB'),
      });

      // Save to database
      const [newMom] = await db.insert(momRecords).values({
        userId,
        conversationId,
        title: momData.title,
        date: new Date(),
        summary: momData.summary,
        developmentAreas: momData.developmentAreas,
        emotionalTone: momData.emotionalTone,
        actionItems: momData.actionItems,
        insights: momData.insights,
        blindspots: momData.blindspots,
        rawTranscript: transcript,
      }).returning();

      console.log(`[MoM Service] ✅ MoM created successfully with ID: ${newMom.id}`);

      // Trigger analytics update (non-blocking)
      analyticsService.autoUpdateAnalytics(userId).catch(err => {
        console.error(`[MoM Service] Analytics auto-update error (non-blocking):`, err);
      });

      // Trigger auto-analysis (Themes & Trends + Blindspots) (non-blocking)
      autoAnalysisService.triggerAutoAnalysis(userId).catch(err => {
        console.error(`[MoM Service] Auto-analysis trigger error (non-blocking):`, err);
      });
    } catch (error) {
      console.error(`[MoM Service] ❌ Error generating MoM for conversation ${conversationId}:`, error);
      // Don't throw - MoM generation failure shouldn't break the chat flow
    }
  }

  /**
   * Manually generate MoM for a specific conversation
   * Used when user explicitly requests MoM generation
   */
  async generateMoMForConversation(conversationId: number, userId: number): Promise<any> {
    try {
      // Verify conversation belongs to user
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (!conversation || conversation.userId !== userId) {
        throw new Error('Conversation not found or unauthorized');
      }

      // Check if MoM already exists
      if (await this.momExists(conversationId)) {
        // Return existing MoM
        const [existing] = await db
          .select()
          .from(momRecords)
          .where(eq(momRecords.conversationId, conversationId))
          .limit(1);
        
        return existing;
      }

      // Build transcript
      const transcript = await this.buildTranscript(conversationId);

      if (!transcript || transcript.length < 50) {
        throw new Error('Conversation is too short to generate meaningful insights');
      }

      // Generate MoM using AI
      const momData = await analysisService.generateMoM({
        transcript,
        date: new Date().toLocaleDateString('en-GB'),
      });

      // Save to database
      const [newMom] = await db.insert(momRecords).values({
        userId,
        conversationId,
        title: momData.title,
        date: new Date(),
        summary: momData.summary,
        developmentAreas: momData.developmentAreas,
        emotionalTone: momData.emotionalTone,
        actionItems: momData.actionItems,
        insights: momData.insights,
        blindspots: momData.blindspots,
        rawTranscript: transcript,
      }).returning();

      console.log(`[MoM Service] ✅ Manual MoM created with ID: ${newMom.id}`);

      // Trigger auto-analysis (non-blocking)
      autoAnalysisService.triggerAutoAnalysis(userId).catch(err => {
        console.error(`[MoM Service] Auto-analysis trigger error (non-blocking):`, err);
      });

      return newMom;
    } catch (error) {
      console.error(`[MoM Service] ❌ Error in manual MoM generation:`, error);
      throw error;
    }
  }

  /**
   * Get all MoMs for a user
   */
  async getUserMoMs(userId: number, limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const moms = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.userId, userId))
        .orderBy(desc(momRecords.date))
        .limit(limit)
        .offset(offset);

      return moms;
    } catch (error) {
      console.error(`[MoM Service] Error fetching MoMs for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific MoM by ID
   */
  async getMoMById(momId: number, userId: number): Promise<any> {
    try {
      const [mom] = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.id, momId))
        .limit(1);

      if (!mom || mom.userId !== userId) {
        throw new Error('MoM not found or unauthorized');
      }

      return mom;
    } catch (error) {
      console.error(`[MoM Service] Error fetching MoM ${momId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a MoM
   */
  async deleteMoM(momId: number, userId: number): Promise<void> {
    try {
      const [mom] = await db
        .select()
        .from(momRecords)
        .where(eq(momRecords.id, momId))
        .limit(1);

      if (!mom || mom.userId !== userId) {
        throw new Error('MoM not found or unauthorized');
      }

      await db.delete(momRecords).where(eq(momRecords.id, momId));
      console.log(`[MoM Service] ✅ MoM ${momId} deleted`);
    } catch (error) {
      console.error(`[MoM Service] Error deleting MoM ${momId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const momService = new MomService();
