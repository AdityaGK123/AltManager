import { db } from '../db/index.js';
import {
  userBadges,
  badgeDefinitions,
  userXpTracking,
  userInsightTimeline,
  userMomentFeedback,
} from '../db/schema.js';
import { eq, and, desc, sql, gte } from 'drizzle-orm';

/**
 * Badge and XP Service
 * Manages gamification: badges, XP, levels, streaks
 */

export interface BadgeCheck {
  earned: boolean;
  badge?: {
    badgeSlug: string;
    badgeName: string;
    level: string;
    category: string;
    description: string;
    icon: string;
    xpValue: number;
  };
}

export interface XPUpdate {
  xpEarned: number;
  totalXp: number;
  currentLevel: number;
  leveledUp: boolean;
  newLevel?: number;
  streakDays: number;
  streakUpdated: boolean;
}

class BadgeService {
  /**
   * Award XP to user and update level/streak
   */
  async awardXP(
    userId: number,
    xpEarned: number,
    category: string
  ): Promise<XPUpdate> {
    console.log(`[Badge] Awarding ${xpEarned} XP to user ${userId} for ${category}`);

    try {
      // Get or create user XP tracking
      let [userXp] = await db
        .select()
        .from(userXpTracking)
        .where(eq(userXpTracking.userId, userId))
        .limit(1);

      if (!userXp) {
        [userXp] = await db
          .insert(userXpTracking)
          .values({
            userId,
            totalXp: 0,
            currentLevel: 1,
            xpToNextLevel: 100,
            categoryXp: {},
            streakDays: 0,
          })
          .returning();
      }

      // Update XP
      const newTotalXp = (userXp.totalXp || 0) + xpEarned;
      const categoryXp = (userXp.categoryXp as any) || {};
      categoryXp[category] = (categoryXp[category] || 0) + xpEarned;

      // Check for level up
      const { currentLevel, xpToNextLevel, leveledUp } = this.calculateLevel(
        newTotalXp,
        userXp.currentLevel || 1
      );

      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const lastPractice = userXp.lastPracticeDate
        ? new Date(userXp.lastPracticeDate).toISOString().split('T')[0]
        : null;

      let streakDays = userXp.streakDays || 0;
      let streakUpdated = false;

      if (lastPractice !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastPractice === yesterdayStr) {
          // Continue streak
          streakDays += 1;
          streakUpdated = true;
        } else if (lastPractice === null || lastPractice < yesterdayStr) {
          // Reset streak
          streakDays = 1;
          streakUpdated = true;
        }
      }

      // Update database
      await db
        .update(userXpTracking)
        .set({
          totalXp: newTotalXp,
          currentLevel,
          xpToNextLevel,
          categoryXp,
          streakDays,
          lastPracticeDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userXpTracking.userId, userId));

      // Create insight if leveled up
      if (leveledUp) {
        await db.insert(userInsightTimeline).values({
          userId,
          momentId: 'system',
          category: 'Achievement',
          insightType: 'milestone',
          title: `Level ${currentLevel} Reached!`,
          description: `You've reached level ${currentLevel}! Your total XP: ${newTotalXp}`,
          metadata: { level: currentLevel, totalXp: newTotalXp },
        });
      }

      // Create insight for streak milestones
      if (streakUpdated && [7, 14, 30, 60, 90].includes(streakDays)) {
        await db.insert(userInsightTimeline).values({
          userId,
          momentId: 'system',
          category: 'Engagement',
          insightType: 'streak',
          title: `${streakDays}-Day Streak! 🔥`,
          description: `You've practiced for ${streakDays} consecutive days. Consistency builds mastery!`,
          metadata: { streakDays },
        });
      }

      return {
        xpEarned,
        totalXp: newTotalXp,
        currentLevel: currentLevel || 1,
        leveledUp,
        newLevel: leveledUp ? currentLevel : undefined,
        streakDays: streakDays || 0,
        streakUpdated,
      };
    } catch (error) {
      console.error('[Badge] Error awarding XP:', error);
      throw error;
    }
  }

  /**
   * Calculate level based on total XP
   */
  private calculateLevel(
    totalXp: number,
    currentLevel: number
  ): { currentLevel: number; xpToNextLevel: number; leveledUp: boolean } {
    // XP required for each level increases: 100, 250, 450, 700, 1000, ...
    const xpForLevel = (level: number) => 100 * level + 50 * level * (level - 1);

    let level = 1;
    let xpAccumulated = 0;

    while (xpAccumulated + xpForLevel(level) <= totalXp) {
      xpAccumulated += xpForLevel(level);
      level++;
    }

    const xpToNextLevel = xpForLevel(level) - (totalXp - xpAccumulated);
    const leveledUp = level > currentLevel;

    return { currentLevel: level, xpToNextLevel, leveledUp };
  }

  /**
   * Check if user earned any badges after completing a moment
   */
  async checkAndAwardBadges(
    userId: number,
    category: string,
    score: number
  ): Promise<BadgeCheck[]> {
    console.log(`[Badge] Checking badges for user ${userId}, category ${category}, score ${score}`);

    try {
      // Get all badge definitions for this category
      const definitions = await db
        .select()
        .from(badgeDefinitions)
        .where(eq(badgeDefinitions.category, category));

      // Get user's existing badges
      const existingBadges = await db
        .select()
        .from(userBadges)
        .where(eq(userBadges.userId, userId));

      const existingBadgeSlugs = new Set(existingBadges.map(b => b.badgeSlug));

      // Get user's feedback history for this category
      const feedbackHistory = await db
        .select()
        .from(userMomentFeedback)
        .where(
          and(
            eq(userMomentFeedback.userId, userId),
            eq(userMomentFeedback.category, category)
          )
        )
        .orderBy(desc(userMomentFeedback.createdAt));

      const results: BadgeCheck[] = [];

      for (const definition of definitions) {
        // Skip if already earned
        if (existingBadgeSlugs.has(definition.badgeSlug)) {
          continue;
        }

        const criteria = definition.criteria as any;
        const earned = this.evaluateBadgeCriteria(
          criteria,
          feedbackHistory,
          score
        );

        if (earned) {
          // Award badge
          await db.insert(userBadges).values({
            userId,
            badgeName: definition.badgeName,
            badgeSlug: definition.badgeSlug,
            level: definition.level,
            category: definition.category,
            description: definition.description,
            icon: definition.icon,
            xpValue: definition.xpValue,
          });

          // Award bonus XP
          await this.awardXP(userId, definition.xpValue || 0, category);

          // Create insight
          await db.insert(userInsightTimeline).values({
            userId,
            momentId: 'system',
            category,
            insightType: 'badge',
            title: `Badge Earned: ${definition.badgeName}`,
            description: definition.description,
            metadata: {
              badgeSlug: definition.badgeSlug,
              level: definition.level,
              xpValue: definition.xpValue || 0,
            },
          });

          results.push({
            earned: true,
            badge: {
              badgeSlug: definition.badgeSlug,
              badgeName: definition.badgeName,
              level: definition.level,
              category: definition.category,
              description: definition.description || '',
              icon: definition.icon || '',
              xpValue: definition.xpValue || 0,
            },
          });

          console.log(`[Badge] Awarded badge: ${definition.badgeName} to user ${userId}`);
        }
      }

      return results;
    } catch (error) {
      console.error('[Badge] Error checking badges:', error);
      return [];
    }
  }

  /**
   * Evaluate if badge criteria are met
   */
  private evaluateBadgeCriteria(
    criteria: any,
    feedbackHistory: any[],
    currentScore: number
  ): boolean {
    // Check completions with minimum score
    if (criteria.completions && criteria.min_score) {
      const qualifyingCompletions = feedbackHistory.filter(
        f => f.score >= criteria.min_score
      ).length;
      return qualifyingCompletions >= criteria.completions;
    }

    // Check perfect score
    if (criteria.perfect_score) {
      return currentScore === 100;
    }

    // Check improvement percentage
    if (criteria.improvement_percent && feedbackHistory.length >= 2) {
      const latestScore = feedbackHistory[0].score;
      const previousScore = feedbackHistory[1].score;
      const improvement = ((latestScore - previousScore) / previousScore) * 100;
      return improvement >= criteria.improvement_percent;
    }

    // Check streak (handled separately in XP tracking)
    if (criteria.streak_days) {
      // This is checked in awardXP method
      return false;
    }

    return false;
  }

  /**
   * Get user's badge progress
   */
  async getUserBadgeProgress(userId: number, category?: string) {
    try {
      // Get earned badges
      const earnedBadges = category
        ? await db
            .select()
            .from(userBadges)
            .where(and(eq(userBadges.userId, userId), eq(userBadges.category, category)))
        : await db
            .select()
            .from(userBadges)
            .where(eq(userBadges.userId, userId));

      // Get available badges
      const availableBadgesQuery = db.select().from(badgeDefinitions);
      const availableBadges = category
        ? await availableBadgesQuery.where(eq(badgeDefinitions.category, category))
        : await availableBadgesQuery;

      // Get feedback history
      const feedbackHistory = category
        ? await db
            .select()
            .from(userMomentFeedback)
            .where(and(eq(userMomentFeedback.userId, userId), eq(userMomentFeedback.category, category)))
        : await db
            .select()
            .from(userMomentFeedback)
            .where(eq(userMomentFeedback.userId, userId));

      const earnedBadgeSlugs = new Set(earnedBadges.map(b => b.badgeSlug));

      // Calculate progress for each available badge
      const badgeProgress = availableBadges.map((badge: any) => {
        const earned = earnedBadgeSlugs.has(badge.badgeSlug);
        const criteria = badge.criteria as any;

        let progress = 0;
        let total = 0;

        if (criteria.completions && criteria.min_score) {
          const qualifyingCompletions = feedbackHistory.filter(
            (f: any) => f.category === badge.category && f.score >= criteria.min_score
          ).length;
          progress = qualifyingCompletions;
          total = criteria.completions;
        }

        return {
          ...badge,
          earned,
          progress,
          total,
          progressPercent: total > 0 ? Math.min((progress / total) * 100, 100) : 0,
        };
      });

      return {
        earnedBadges,
        badgeProgress,
        totalEarned: earnedBadges.length,
        totalAvailable: availableBadges.length,
      };
    } catch (error) {
      console.error('[Badge] Error getting badge progress:', error);
      throw error;
    }
  }

  /**
   * Get user's XP and level info
   */
  async getUserXP(userId: number) {
    try {
      const [userXp] = await db
        .select()
        .from(userXpTracking)
        .where(eq(userXpTracking.userId, userId))
        .limit(1);

      if (!userXp) {
        return {
          totalXp: 0,
          currentLevel: 1,
          xpToNextLevel: 100,
          categoryXp: {},
          streakDays: 0,
          lastPracticeDate: null,
        };
      }

      return userXp;
    } catch (error) {
      console.error('[Badge] Error getting user XP:', error);
      throw error;
    }
  }
}

export const badgeService = new BadgeService();
