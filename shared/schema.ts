import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: text("password_hash"), // bcrypt hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Authentication fields
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  
  // Account security
  failedLoginAttempts: varchar("failed_login_attempts").default("0"),
  accountLockedUntil: timestamp("account_locked_until"),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: text("mfa_secret"), // TOTP secret for MFA
  
  // Terms and privacy acceptance
  termsAccepted: boolean("terms_accepted").default(false),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  privacyAccepted: boolean("privacy_accepted").default(false),
  privacyAcceptedAt: timestamp("privacy_accepted_at"),
  
  // Account status
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // HiPo Coach specific fields
  currentRole: text("current_role"),
  industry: text("industry"),
  careerStage: text("career_stage"),
  fiveYearGoal: text("five_year_goal"),
  biggestChallenge: text("biggest_challenge"),
  workEnvironment: text("work_environment"),
  primaryCoaches: text("primary_coaches").array(),
  
  // Notification preferences
  emailNotifications: boolean("email_notifications").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  weeklyDigest: boolean("weekly_digest").default(true),
  coachingReminders: boolean("coaching_reminders").default(true),
});

// User profiles for detailed coaching context
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentRole: text("current_role"),
  industry: text("industry"),
  careerStage: text("career_stage"),
  fiveYearGoal: text("five_year_goal"),
  biggestChallenge: text("biggest_challenge"),
  workEnvironment: text("work_environment"),
  primaryCoaches: text("primary_coaches").array(),
  isOnboardingComplete: boolean("is_onboarding_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coaching sessions
export const coachingSessions = pgTable("coaching_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  coachType: text("coach_type").notNull(), // leadership, performance, career, hipo, life, empathear
  messages: jsonb("messages").notNull(), // array of messages
  summary: text("summary"),
  hearted: boolean("hearted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved advice (hearted messages)
export const savedAdvice = pgTable("saved_advice", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").notNull().references(() => coachingSessions.id),
  messageContent: text("message_content").notNull(),
  coachType: text("coach_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema types
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoachingSessionSchema = createInsertSchema(coachingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSavedAdviceSchema = createInsertSchema(savedAdvice).omit({
  id: true,
  createdAt: true,
});

// Update schemas for PATCH requests
export const updateCoachingSessionSchema = z.object({
  summary: z.string().optional(),
  hearted: z.boolean().optional(),
  messages: z.array(z.object({
    id: z.string(),
    content: z.string(),
    isUser: z.boolean(),
    timestamp: z.union([z.string(), z.date()]).transform(val => 
      typeof val === 'string' ? new Date(val) : val
    )
  })).optional(),
});

export const updateSavedAdviceSchema = z.object({
  messageContent: z.string().optional(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;
// Authentication-related tables
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  deviceInfo: text("device_info"), // Browser/device info
  ipAddress: varchar("ip_address"),
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  used: boolean("used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact support messages table
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  category: varchar("category", { length: 100 }).default("general"),
  status: varchar("status", { length: 50 }).default("open"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  userId: varchar("user_id").references(() => users.id), // Optional - for logged-in users
  responseMessage: text("response_message"),
  responseDate: timestamp("response_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email logs table for tracking sent emails
export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toEmail: varchar("to_email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  template: varchar("template", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, sent, failed
  provider: varchar("provider", { length: 50 }).default("sendgrid"),
  messageId: varchar("message_id", { length: 255 }),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Authentication Schemas
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain uppercase, lowercase, number, and special character"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms of Service" }) }),
  privacyAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the Privacy Policy" }) }),
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain uppercase, lowercase, number, and special character"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain uppercase, lowercase, number, and special character"),
});

export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// User profile update schema
export const updateUserProfileSchema = z.object({
  currentRole: z.string().min(1, "Current role is required").optional(),
  industry: z.string().min(1, "Industry is required").optional(),
  careerStage: z.string().min(1, "Career stage is required").optional(),
  fiveYearGoal: z.string().min(1, "Five year goal is required").optional(),
  biggestChallenge: z.string().min(1, "Biggest challenge is required").optional(),
  workEnvironment: z.string().min(1, "Work environment is required").optional(),
  primaryCoaches: z.array(z.string()).max(2, "Maximum 2 primary coaches allowed").optional(),
});

// Export additional types
export type UserSession = typeof userSessions.$inferSelect;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

// Communication system schemas (must come after table declarations)
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  priority: true,
  responseMessage: true,
  responseDate: true,
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export type SavedAdvice = typeof savedAdvice.$inferSelect;
export type InsertSavedAdvice = z.infer<typeof insertSavedAdviceSchema>;

// Communication system types
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;