import { 
  type User, 
  type UpsertUser, 
  type CoachingSession, 
  type InsertCoachingSession, 
  type SavedAdvice, 
  type InsertSavedAdvice,
  type UserSession,
  type EmailVerificationToken,
  type PasswordResetToken,
  type ContactMessage,
  type InsertContactMessage,
  type EmailLog,
  type InsertEmailLog,
  type UpdateUserProfileInput,
  userProfiles
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserByEmail(email: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Coaching session methods
  createCoachingSession(session: InsertCoachingSession): Promise<CoachingSession>;
  getCoachingSession(id: string): Promise<CoachingSession | undefined>;
  getUserCoachingSessions(userId: string): Promise<CoachingSession[]>;
  getCoachingSessionsByUserId(userId: string): Promise<CoachingSession[]>;
  updateCoachingSession(id: string, updates: Partial<CoachingSession>): Promise<CoachingSession | undefined>;
  
  // Saved advice methods
  createSavedAdvice(advice: InsertSavedAdvice): Promise<SavedAdvice>;
  getUserSavedAdvice(userId: string): Promise<SavedAdvice[]>;
  getSavedAdviceByUserId(userId: string): Promise<SavedAdvice[]>;
  deleteSavedAdvice(id: string): Promise<boolean>;

  // Authentication-related methods
  // Email verification tokens
  createEmailVerificationToken(data: { email: string; token: string; expiresAt: Date }): Promise<EmailVerificationToken>;
  getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined>;
  deleteEmailVerificationToken(token: string): Promise<boolean>;

  // Password reset tokens  
  createPasswordResetToken(data: { userId: string; token: string; used: boolean; expiresAt: Date }): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<boolean>;

  // User sessions
  createUserSession(data: { userId: string; sessionToken: string; deviceInfo?: string; ipAddress?: string; expiresAt: Date }): Promise<UserSession>;
  getUserSession(sessionToken: string): Promise<UserSession | undefined>;
  updateUserSession(sessionId: string, updates: Partial<UserSession>): Promise<UserSession | undefined>;
  deleteUserSession(sessionId: string): Promise<boolean>;
  deleteUserSessionByToken(sessionToken: string): Promise<boolean>;
  deleteAllUserSessions(userId: string): Promise<boolean>;
  getUserSessions(userId: string): Promise<UserSession[]>;
  
  // Contact messages
  createContactMessage(data: InsertContactMessage): Promise<ContactMessage>;
  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  updateContactMessage(id: string, data: Partial<ContactMessage>): Promise<ContactMessage | undefined>;
  
  // Email logs
  createEmailLog(data: InsertEmailLog): Promise<EmailLog>;
  getEmailLog(id: string): Promise<EmailLog | undefined>;
  getEmailLogsByRecipient(email: string): Promise<EmailLog[]>;
  
  // User profile methods
  getUserProfile(userId: string): Promise<typeof userProfiles.$inferSelect | undefined>;
  upsertUserProfile(userId: string, data: UpdateUserProfileInput): Promise<typeof userProfiles.$inferSelect>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private coachingSessions: Map<string, CoachingSession>;
  private savedAdvice: Map<string, SavedAdvice>;
  private userSessions: Map<string, UserSession>;
  private emailVerificationTokens: Map<string, EmailVerificationToken>;
  private passwordResetTokens: Map<string, PasswordResetToken>;
  private contactMessages: Map<string, ContactMessage>;
  private emailLogs: Map<string, EmailLog>;
  private userProfiles: Map<string, typeof userProfiles.$inferSelect>;

  constructor() {
    this.users = new Map();
    this.coachingSessions = new Map();
    this.savedAdvice = new Map();
    this.userSessions = new Map();
    this.emailVerificationTokens = new Map();
    this.passwordResetTokens = new Map();
    this.contactMessages = new Map();
    this.emailLogs = new Map();
    this.userProfiles = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: UpsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: insertUser.email!,
      passwordHash: insertUser.passwordHash || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      
      // Authentication fields
      emailVerified: insertUser.emailVerified || false,
      emailVerificationToken: insertUser.emailVerificationToken || null,
      emailVerificationExpires: insertUser.emailVerificationExpires || null,
      passwordResetToken: insertUser.passwordResetToken || null,
      passwordResetExpires: insertUser.passwordResetExpires || null,
      
      // Account security
      failedLoginAttempts: insertUser.failedLoginAttempts || "0",
      accountLockedUntil: insertUser.accountLockedUntil || null,
      mfaEnabled: insertUser.mfaEnabled || false,
      mfaSecret: insertUser.mfaSecret || null,
      
      // Terms and privacy
      termsAccepted: insertUser.termsAccepted || false,
      termsAcceptedAt: insertUser.termsAcceptedAt || null,
      privacyAccepted: insertUser.privacyAccepted || false,
      privacyAcceptedAt: insertUser.privacyAcceptedAt || null,
      
      // Account status
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      lastLoginAt: insertUser.lastLoginAt || null,
      
      // Notification preferences
      emailNotifications: insertUser.emailNotifications !== undefined ? insertUser.emailNotifications : true,
      marketingEmails: insertUser.marketingEmails !== undefined ? insertUser.marketingEmails : false,
      weeklyDigest: insertUser.weeklyDigest !== undefined ? insertUser.weeklyDigest : true,
      coachingReminders: insertUser.coachingReminders !== undefined ? insertUser.coachingReminders : true,
      
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // HiPo Coach specific fields
      currentRole: insertUser.currentRole || null,
      industry: insertUser.industry || null,
      careerStage: insertUser.careerStage || null,
      fiveYearGoal: insertUser.fiveYearGoal || null,
      biggestChallenge: insertUser.biggestChallenge || null,
      workEnvironment: insertUser.workEnvironment || null,
      primaryCoaches: insertUser.primaryCoaches || null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated: User = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async updateUserByEmail(email: string, updates: Partial<User>): Promise<User | undefined> {
    const existing = await this.getUserByEmail(email);
    if (!existing) return undefined;
    
    return this.updateUser(existing.id, updates);
  }

  async deleteUser(id: string): Promise<boolean> {
    // Also delete related data
    await this.deleteAllUserSessions(id);
    
    // Delete user's coaching sessions
    const sessions = await this.getUserCoachingSessions(id);
    for (const session of sessions) {
      this.coachingSessions.delete(session.id);
    }
    
    // Delete user's saved advice
    const advice = await this.getUserSavedAdvice(id);
    for (const item of advice) {
      this.savedAdvice.delete(item.id);
    }
    
    return this.users.delete(id);
  }

  // Coaching session methods
  async createCoachingSession(insertSession: InsertCoachingSession): Promise<CoachingSession> {
    const id = randomUUID();
    const session: CoachingSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      summary: insertSession.summary || null,
      hearted: insertSession.hearted || false,
    };
    this.coachingSessions.set(id, session);
    return session;
  }

  async getCoachingSession(id: string): Promise<CoachingSession | undefined> {
    return this.coachingSessions.get(id);
  }

  async getUserCoachingSessions(userId: string): Promise<CoachingSession[]> {
    return Array.from(this.coachingSessions.values()).filter(
      (session) => session.userId === userId,
    );
  }

  async getCoachingSessionsByUserId(userId: string): Promise<CoachingSession[]> {
    return this.getUserCoachingSessions(userId);
  }

  async updateCoachingSession(id: string, updates: Partial<CoachingSession>): Promise<CoachingSession | undefined> {
    const existing = this.coachingSessions.get(id);
    if (!existing) return undefined;
    
    const updated: CoachingSession = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.coachingSessions.set(id, updated);
    return updated;
  }

  // Saved advice methods
  async createSavedAdvice(insertAdvice: InsertSavedAdvice): Promise<SavedAdvice> {
    const id = randomUUID();
    const advice: SavedAdvice = {
      ...insertAdvice,
      id,
      createdAt: new Date(),
    };
    this.savedAdvice.set(id, advice);
    return advice;
  }

  async getUserSavedAdvice(userId: string): Promise<SavedAdvice[]> {
    return Array.from(this.savedAdvice.values()).filter(
      (advice) => advice.userId === userId,
    );
  }

  async getSavedAdviceByUserId(userId: string): Promise<SavedAdvice[]> {
    return this.getUserSavedAdvice(userId);
  }

  async deleteSavedAdvice(id: string): Promise<boolean> {
    return this.savedAdvice.delete(id);
  }

  // Authentication-related methods
  
  // Email verification tokens
  async createEmailVerificationToken(data: { email: string; token: string; expiresAt: Date }): Promise<EmailVerificationToken> {
    const id = randomUUID();
    const token: EmailVerificationToken = {
      id,
      email: data.email,
      token: data.token,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };
    this.emailVerificationTokens.set(data.token, token);
    return token;
  }

  async getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined> {
    return this.emailVerificationTokens.get(token);
  }

  async deleteEmailVerificationToken(token: string): Promise<boolean> {
    return this.emailVerificationTokens.delete(token);
  }

  // Password reset tokens
  async createPasswordResetToken(data: { userId: string; token: string; used: boolean; expiresAt: Date }): Promise<PasswordResetToken> {
    const id = randomUUID();
    const token: PasswordResetToken = {
      id,
      userId: data.userId,
      token: data.token,
      used: data.used,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };
    this.passwordResetTokens.set(data.token, token);
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    return this.passwordResetTokens.get(token);
  }

  async markPasswordResetTokenUsed(token: string): Promise<boolean> {
    const tokenRecord = this.passwordResetTokens.get(token);
    if (!tokenRecord) return false;
    
    tokenRecord.used = true;
    this.passwordResetTokens.set(token, tokenRecord);
    return true;
  }

  // User sessions
  async createUserSession(data: { userId: string; sessionToken: string; deviceInfo?: string; ipAddress?: string; expiresAt: Date }): Promise<UserSession> {
    const id = randomUUID();
    const session: UserSession = {
      id,
      userId: data.userId,
      sessionToken: data.sessionToken,
      deviceInfo: data.deviceInfo || null,
      ipAddress: data.ipAddress || null,
      lastActive: new Date(),
      createdAt: new Date(),
      expiresAt: data.expiresAt,
    };
    this.userSessions.set(data.sessionToken, session);
    return session;
  }

  async getUserSession(sessionToken: string): Promise<UserSession | undefined> {
    return this.userSessions.get(sessionToken);
  }

  async updateUserSession(sessionId: string, updates: Partial<UserSession>): Promise<UserSession | undefined> {
    const existing = Array.from(this.userSessions.values()).find(s => s.id === sessionId);
    if (!existing) return undefined;
    
    const updated: UserSession = {
      ...existing,
      ...updates,
    };
    this.userSessions.set(existing.sessionToken, updated);
    return updated;
  }

  async deleteUserSession(sessionId: string): Promise<boolean> {
    const existing = Array.from(this.userSessions.entries()).find(([, s]) => s.id === sessionId);
    if (!existing) return false;
    
    return this.userSessions.delete(existing[0]);
  }

  async deleteUserSessionByToken(sessionToken: string): Promise<boolean> {
    return this.userSessions.delete(sessionToken);
  }

  async deleteAllUserSessions(userId: string): Promise<boolean> {
    const userSessions = Array.from(this.userSessions.entries()).filter(([, s]) => s.userId === userId);
    userSessions.forEach(([token]) => {
      this.userSessions.delete(token);
    });
    return true;
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return Array.from(this.userSessions.values()).filter(s => s.userId === userId);
  }

  // Contact message methods
  async createContactMessage(data: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const contactMessage: ContactMessage = {
      id,
      ...data,
      status: 'open',
      priority: 'medium',
      category: data.category || null,
      userId: data.userId || null,
      responseMessage: null,
      responseDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contactMessages.set(id, contactMessage);
    return contactMessage;
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async updateContactMessage(id: string, data: Partial<ContactMessage>): Promise<ContactMessage | undefined> {
    const existing = this.contactMessages.get(id);
    if (!existing) return undefined;
    
    const updated: ContactMessage = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.contactMessages.set(id, updated);
    return updated;
  }

  // Email log methods
  async createEmailLog(data: InsertEmailLog): Promise<EmailLog> {
    const id = randomUUID();
    const emailLog: EmailLog = {
      id,
      ...data,
      status: data.status || 'pending',
      provider: data.provider || 'sendgrid',
      messageId: data.messageId || null,
      errorMessage: data.errorMessage || null,
      sentAt: null,
      createdAt: new Date(),
    };
    this.emailLogs.set(id, emailLog);
    return emailLog;
  }

  async getEmailLog(id: string): Promise<EmailLog | undefined> {
    return this.emailLogs.get(id);
  }

  async getEmailLogsByRecipient(email: string): Promise<EmailLog[]> {
    return Array.from(this.emailLogs.values()).filter(log => log.toEmail === email);
  }
  
  // User profile methods
  async getUserProfile(userId: string): Promise<typeof userProfiles.$inferSelect | undefined> {
    return Array.from(this.userProfiles.values()).find(profile => profile.userId === userId);
  }
  
  async upsertUserProfile(userId: string, data: UpdateUserProfileInput): Promise<typeof userProfiles.$inferSelect> {
    const existingProfile = Array.from(this.userProfiles.values()).find(profile => profile.userId === userId);
    
    if (existingProfile) {
      // Update existing profile
      const updated: typeof userProfiles.$inferSelect = {
        ...existingProfile,
        ...data,
        updatedAt: new Date(),
      };
      this.userProfiles.set(existingProfile.id, updated);
      return updated;
    } else {
      // Create new profile
      const id = randomUUID();
      const newProfile: typeof userProfiles.$inferSelect = {
        id,
        userId,
        currentRole: data.currentRole || null,
        industry: data.industry || null,
        careerStage: data.careerStage || null,
        fiveYearGoal: data.fiveYearGoal || null,
        biggestChallenge: data.biggestChallenge || null,
        workEnvironment: data.workEnvironment || null,
        primaryCoaches: data.primaryCoaches || null,
        isOnboardingComplete: true, // Set to true when profile is saved
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.userProfiles.set(id, newProfile);
      return newProfile;
    }
  }
}

export const storage = new MemStorage();
