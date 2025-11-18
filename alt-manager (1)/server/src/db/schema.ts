import { pgTable, text, serial, timestamp, integer, boolean, jsonb, varchar, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const managerToneEnum = pgEnum('manager_tone', ['supportive', 'direct', 'balanced']);
export const achievementTierEnum = pgEnum('achievement_tier', ['bronze', 'silver', 'gold']);
export const momentStatusEnum = pgEnum('moment_status', ['not_started', 'in_progress', 'completed']);
export const diagnosticStatusEnum = pgEnum('diagnostic_status', ['success', 'error', 'timeout', 'retry']);

// Users table - adapted to existing database schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  emailVerified: boolean('email_verified').default(false),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  role: text('role').notNull().default('user'),
  experience: integer('experience').notNull().default(0),
  company: varchar('company', { length: 255 }),
  industry: varchar('industry', { length: 255 }),
  timezone: varchar('timezone', { length: 100 }),
  roleTitle: varchar('role_title', { length: 255 }),
  organization: varchar('organization', { length: 255 }),
  motivation: text('motivation'),
  supportNeeds: text('support_needs'),
  managementStyle: varchar('management_style', { length: 100 }),
  workLifeBalance: integer('work_life_balance'),
  learningGoals: jsonb('learning_goals'),
  careerAspiration: varchar('career_aspiration', { length: 255 }),
  feedbackPreference: varchar('feedback_preference', { length: 100 }),
  motivationFactors: jsonb('motivation_factors'),
  communicationStyle: varchar('communication_style', { length: 100 }),
  flexibilityNeeds: jsonb('flexibility_needs'),
  generationGroup: varchar('generation_group', { length: 50 }),
  currentKras: jsonb('current_kras'),
  quarterlyGoals: jsonb('quarterly_goals'),
  skillTrackingEnabled: boolean('skill_tracking_enabled').default(true),
  salaryReviewFrequency: varchar('salary_review_frequency', { length: 50 }),
  tokenUsage: integer('token_usage').default(0),
  dailyTokenUsage: integer('daily_token_usage').default(0),
  lastTokenReset: timestamp('last_token_reset'),
  hasSeenTour: boolean('has_seen_tour').default(false),
  graduated: boolean('graduated').default(false),
  graduationDate: timestamp('graduation_date'),
  graduationCriteria: jsonb('graduation_criteria'),
  unlockedPhases: jsonb('unlocked_phases'),
  currentPhase: varchar('current_phase', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User profiles table
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  roleTitle: varchar('role_title', { length: 255 }),
  experienceYears: integer('experience_years').default(0),
  careerGoals: text('career_goals'),
  currentChallenges: text('current_challenges'),
  managerTone: managerToneEnum('manager_tone').default('balanced'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  level: integer('level').default(1),
  experiencePoints: integer('experience_points').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Skills table
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  currentLevel: integer('current_level').default(0),
  targetLevel: integer('target_level').default(100),
  progress: integer('progress').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Goals table
export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  targetDate: timestamp('target_date'),
  completed: boolean('completed').default(false),
  progress: integer('progress').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Achievements/Trophies table
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  createdAt: timestamp('created_at'),
});

// Conversations table
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Manager Moments table (existing schema from database)
export const managerMoments = pgTable('manager_moments', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  prompt: text('prompt'),
  category: text('category'),
  tags: jsonb('tags'),
  voiceVersion: text('voice_version'),
});

// User Manager Moments Progress table
export const userMoments = pgTable('user_moments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  momentId: varchar('moment_id', { length: 255 }).notNull(),
  status: momentStatusEnum('status').default('not_started'),
  score: integer('score'),
  feedback: jsonb('feedback'),
  attempts: integer('attempts').default(0),
  lastPracticedAt: timestamp('last_practiced_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Moment Completions table (tracks each attempt)
export const momentCompletions = pgTable('moment_completions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  momentId: varchar('moment_id', { length: 255 }).notNull(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  turnCount: integer('turn_count').default(0),
  transcript: jsonb('transcript'), // Array of {role, content, timestamp}
  status: varchar('status', { length: 50 }).default('in_progress'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Moment Debriefs table (stores rubric scores and feedback)
export const momentDebriefs = pgTable('moment_debriefs', {
  id: serial('id').primaryKey(),
  completionId: integer('completion_id').references(() => momentCompletions.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  momentId: varchar('moment_id', { length: 255 }).notNull(),
  score: integer('score').notNull(),
  evidenceQuotes: jsonb('evidence_quotes'),
  strengths: jsonb('strengths'),
  improvements: jsonb('improvements'),
  exemplarRewrite: text('exemplar_rewrite'),
  microHabit: text('micro_habit'),
  templates: jsonb('templates'),
  rubricScores: jsonb('rubric_scores'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Peer Examples table (anonymized examples for learning)
export const momentPeerExamples = pgTable('moment_peer_examples', {
  id: serial('id').primaryKey(),
  momentId: varchar('moment_id', { length: 255 }).notNull(),
  exampleText: text('example_text').notNull(),
  score: integer('score').notNull(),
  whatWorked: text('what_worked'),
  context: varchar('context', { length: 255 }),
  isApproved: boolean('is_approved').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Practice Loop Variants table
export const momentPracticeVariants = pgTable('moment_practice_variants', {
  id: serial('id').primaryKey(),
  baseMomentId: varchar('base_moment_id', { length: 255 }).notNull(),
  variantType: varchar('variant_type', { length: 50 }).notNull(),
  caselet: text('caselet').notNull(),
  roleplayConfig: jsonb('roleplay_config'),
  difficultyModifier: integer('difficulty_modifier').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Habits/Micro-habits table
export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  frequency: varchar('frequency', { length: 50 }), // daily, weekly, etc.
  streak: integer('streak').default(0),
  lastCompletedAt: timestamp('last_completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Saved Recommendations table
export const savedRecommendations = pgTable('saved_recommendations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  source: varchar('source', { length: 100 }), // conversation, moment, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Minutes of Meeting (MoM) Records table
export const momRecords = pgTable('mom_records', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  conversationId: integer('conversation_id').references(() => conversations.id),
  title: varchar('title', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),
  summary: text('summary').notNull(), // 3-line summary
  developmentAreas: jsonb('development_areas'), // Array of tags
  emotionalTone: varchar('emotional_tone', { length: 100 }),
  actionItems: jsonb('action_items'), // Array of 3 action items
  insights: jsonb('insights'), // Array of 3 insights
  blindspots: jsonb('blindspots'), // Array of 2-3 blindspots
  rawTranscript: text('raw_transcript'), // Original conversation
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Trend Analysis table
export const trendAnalysis = pgTable('trend_analysis', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  analysisDate: timestamp('analysis_date').defaultNow().notNull(),
  primaryDevelopmentAreas: jsonb('primary_development_areas'), // Ranked by frequency
  contentThemeClusters: jsonb('content_theme_clusters'), // 3-5 major themes
  emotionalTrajectory: jsonb('emotional_trajectory'), // Dominant emotions, patterns, correlations
  summaryInsights: jsonb('summary_insights'), // 3-4 high-level insights
  momCount: integer('mom_count').default(0), // Number of MoMs analyzed
  dateRange: jsonb('date_range'), // {start, end}
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Blindspot Analysis table
export const blindspotAnalysis = pgTable('blindspot_analysis', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  analysisDate: timestamp('analysis_date').defaultNow().notNull(),
  recurringBlindspots: jsonb('recurring_blindspots'), // Patterns across sessions
  whatRemainsUnsaid: jsonb('what_remains_unsaid'), // Topics avoided
  operatingAssumptions: jsonb('operating_assumptions'), // Beliefs visible
  unrecognizedStrengths: jsonb('unrecognized_strengths'), // Hidden capabilities
  growthBlockers: jsonb('growth_blockers'), // Mindset/behavioral blockers
  metaPatterns: jsonb('meta_patterns'), // Patterns about patterns
  developmentHypotheses: jsonb('development_hypotheses'), // 2-3 core hypotheses
  momCount: integer('mom_count').default(0),
  dateRange: jsonb('date_range'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Progress Analysis table
export const progressAnalysis = pgTable('progress_analysis', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  analysisDate: timestamp('analysis_date').defaultNow().notNull(),
  keyThemes: jsonb('key_themes'), // 2-3 themes with progress indicators
  movementOnAreas: jsonb('movement_on_areas'), // Development area progress
  actionItemEvolution: jsonb('action_item_evolution'), // Completion patterns
  mindsetShifts: jsonb('mindset_shifts'), // Observable changes
  capabilityBuilding: jsonb('capability_building'), // New skills emerging
  smallWins: jsonb('small_wins'), // Momentum signals
  stuckPoints: jsonb('stuck_points'), // Where progress stalled
  overallTrajectory: text('overall_trajectory'), // Big-picture story
  progressScores: jsonb('progress_scores'), // Dashboard scores (1-5)
  momCount: integer('mom_count').default(0),
  dateRange: jsonb('date_range'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Helper type for backward compatibility
export type UserBasic = {
  id: number;
  email: string;
  name: string;
};
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type ManagerMoment = typeof managerMoments.$inferSelect;
export type NewManagerMoment = typeof managerMoments.$inferInsert;
export type UserMoment = typeof userMoments.$inferSelect;
export type NewUserMoment = typeof userMoments.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type SavedRecommendation = typeof savedRecommendations.$inferSelect;
export type NewSavedRecommendation = typeof savedRecommendations.$inferInsert;
export type MomRecord = typeof momRecords.$inferSelect;
export type NewMomRecord = typeof momRecords.$inferInsert;
export type TrendAnalysis = typeof trendAnalysis.$inferSelect;
export type NewTrendAnalysis = typeof trendAnalysis.$inferInsert;
export type BlindspotAnalysis = typeof blindspotAnalysis.$inferSelect;
export type NewBlindspotAnalysis = typeof blindspotAnalysis.$inferInsert;
export type ProgressAnalysis = typeof progressAnalysis.$inferSelect;
export type NewProgressAnalysis = typeof progressAnalysis.$inferInsert;
export type MomentCompletion = typeof momentCompletions.$inferSelect;
export type NewMomentCompletion = typeof momentCompletions.$inferInsert;
export type MomentDebrief = typeof momentDebriefs.$inferSelect;
export type NewMomentDebrief = typeof momentDebriefs.$inferInsert;
export type MomentPeerExample = typeof momentPeerExamples.$inferSelect;
export type NewMomentPeerExample = typeof momentPeerExamples.$inferInsert;
export type MomentPracticeVariant = typeof momentPracticeVariants.$inferSelect;
export type NewMomentPracticeVariant = typeof momentPracticeVariants.$inferInsert;

// Moment Diagnostics table - for performance monitoring
export const momentDiagnostics = pgTable('moment_diagnostics', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  status: diagnosticStatusEnum('status').notNull(),
  durationMs: integer('duration_ms').notNull(),
  errorMessage: text('error_message'),
  userId: integer('user_id'),
  metadata: jsonb('metadata'),
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
});

export type MomentDiagnostic = typeof momentDiagnostics.$inferSelect;
export type NewMomentDiagnostic = typeof momentDiagnostics.$inferInsert;

// Conversational Coaching System Tables

// User Moment Feedback - detailed rubric-based feedback
export const userMomentFeedback = pgTable('user_moment_feedback', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  momentId: varchar('moment_id', { length: 255 }).notNull(),
  completionId: integer('completion_id').references(() => momentCompletions.id),
  rubric: jsonb('rubric').notNull(), // Detailed rubric scores
  feedback: text('feedback').notNull(), // Natural language coaching
  managerTone: text('manager_tone'), // Tone of feedback
  category: varchar('category', { length: 100 }).notNull(),
  score: integer('score').notNull(),
  xpEarned: integer('xp_earned').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Badges - achievement system
export const userBadges = pgTable('user_badges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  badgeName: varchar('badge_name', { length: 255 }).notNull(),
  badgeSlug: varchar('badge_slug', { length: 255 }).notNull(),
  level: varchar('level', { length: 50 }).notNull(), // bronze, silver, gold, platinum
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  xpValue: integer('xp_value').default(0),
  achievedAt: timestamp('achieved_at').defaultNow().notNull(),
});

// User XP Tracking - gamification
export const userXpTracking = pgTable('user_xp_tracking', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  totalXp: integer('total_xp').default(0),
  currentLevel: integer('current_level').default(1),
  xpToNextLevel: integer('xp_to_next_level').default(100),
  categoryXp: jsonb('category_xp').default('{}'), // XP breakdown by category
  streakDays: integer('streak_days').default(0),
  lastPracticeDate: timestamp('last_practice_date'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Insight Timeline - improvement tracking
export const userInsightTimeline = pgTable('user_insight_timeline', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  momentId: varchar('moment_id', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  insightType: varchar('insight_type', { length: 50 }).notNull(), // improvement, milestone, streak, badge
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  metadata: jsonb('metadata'), // Additional context
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Conversation Memory - session summaries for personalization
export const conversationMemory = pgTable('conversation_memory', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  momentId: varchar('moment_id', { length: 255 }).notNull(),
  sessionSummary: text('session_summary'),
  keyLearnings: jsonb('key_learnings'),
  score: integer('score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Badge Definitions - master list of badges
export const badgeDefinitions = pgTable('badge_definitions', {
  id: serial('id').primaryKey(),
  badgeSlug: varchar('badge_slug', { length: 255 }).notNull().unique(),
  badgeName: varchar('badge_name', { length: 255 }).notNull(),
  level: varchar('level', { length: 50 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 100 }),
  criteria: jsonb('criteria').notNull(), // Requirements to earn
  xpValue: integer('xp_value').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export types for new tables
export type UserMomentFeedback = typeof userMomentFeedback.$inferSelect;
export type NewUserMomentFeedback = typeof userMomentFeedback.$inferInsert;
export type UserBadge = typeof userBadges.$inferSelect;
export type NewUserBadge = typeof userBadges.$inferInsert;
export type UserXpTracking = typeof userXpTracking.$inferSelect;
export type NewUserXpTracking = typeof userXpTracking.$inferInsert;
export type UserInsightTimeline = typeof userInsightTimeline.$inferSelect;
export type NewUserInsightTimeline = typeof userInsightTimeline.$inferInsert;
export type ConversationMemory = typeof conversationMemory.$inferSelect;
export type NewConversationMemory = typeof conversationMemory.$inferInsert;
export type BadgeDefinition = typeof badgeDefinitions.$inferSelect;
export type NewBadgeDefinition = typeof badgeDefinitions.$inferInsert;
