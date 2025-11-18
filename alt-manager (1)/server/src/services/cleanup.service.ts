import { db } from '../db/index.js';
import { conversations, messages } from '../db/schema.js';
import { sql } from 'drizzle-orm';

/**
 * Cleanup Service
 * Automatically removes conversations beyond the 5 most recent per user
 * Ensures database remains lightweight and cost-efficient
 */
class CleanupService {
  /**
   * Delete old conversations for a specific user
   * Keeps only the 5 most recent conversations
   * @param userId - The user ID to clean up conversations for
   */
  async cleanupUserConversations(userId: number): Promise<number> {
    try {
      console.log(`[Cleanup] Starting cleanup for user ${userId}...`);

      // Get IDs of conversations to keep (top 5 most recent)
      const conversationsToKeep = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(sql`${conversations.userId} = ${userId}`)
        .orderBy(sql`${conversations.updatedAt} DESC`)
        .limit(5);

      const keepIds = conversationsToKeep.map(c => c.id);

      if (keepIds.length === 0) {
        console.log(`[Cleanup] No conversations found for user ${userId}`);
        return 0;
      }

      // Delete messages for conversations that will be removed
      const deletedMessages = await db
        .delete(messages)
        .where(
          sql`${messages.conversationId} NOT IN (${sql.join(keepIds.map(id => sql`${id}`), sql`, `)}) 
              AND ${messages.conversationId} IN (
                SELECT id FROM ${conversations} WHERE ${conversations.userId} = ${userId}
              )`
        );

      // Delete old conversations (keeping only top 5)
      const deletedConversations = await db
        .delete(conversations)
        .where(
          sql`${conversations.id} NOT IN (${sql.join(keepIds.map(id => sql`${id}`), sql`, `)}) 
              AND ${conversations.userId} = ${userId}`
        );

      console.log(`[Cleanup] ✅ Cleanup completed for user ${userId}`);
      console.log(`[Cleanup] Kept ${keepIds.length} conversations, removed older ones`);

      return keepIds.length;
    } catch (error) {
      console.error(`[Cleanup] ❌ Error cleaning up conversations for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Clean up conversations for all users
   * Useful for scheduled maintenance tasks
   */
  async cleanupAllUsers(): Promise<void> {
    try {
      console.log('[Cleanup] Starting global cleanup...');

      // Get all unique user IDs
      const users = await db
        .selectDistinct({ userId: conversations.userId })
        .from(conversations);

      console.log(`[Cleanup] Found ${users.length} users with conversations`);

      for (const user of users) {
        await this.cleanupUserConversations(user.userId);
      }

      console.log('[Cleanup] ✅ Global cleanup completed');
    } catch (error) {
      console.error('[Cleanup] ❌ Error during global cleanup:', error);
      throw error;
    }
  }

  /**
   * Trigger cleanup after a new conversation is created
   * Ensures the 5-conversation limit is maintained in real-time
   * @param userId - The user ID who created a new conversation
   */
  async cleanupAfterCreate(userId: number): Promise<void> {
    try {
      // Count total conversations for user
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(conversations)
        .where(sql`${conversations.userId} = ${userId}`);

      const count = Number(result[0]?.count || 0);

      // Only cleanup if user has more than 5 conversations
      if (count > 5) {
        console.log(`[Cleanup] User ${userId} has ${count} conversations, triggering cleanup...`);
        await this.cleanupUserConversations(userId);
      }
    } catch (error) {
      console.error(`[Cleanup] ❌ Error in cleanup after create for user ${userId}:`, error);
      // Don't throw - cleanup failure shouldn't break conversation creation
    }
  }
}

export const cleanupService = new CleanupService();
