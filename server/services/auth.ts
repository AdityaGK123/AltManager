import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import {
  User,
  SignUpInput,
  SignInInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  EmailVerificationInput,
  EmailVerificationToken,
  PasswordResetToken,
  UserSession
} from '@shared/schema';

const SALT_ROUNDS = 12;
const LOCKOUT_THRESHOLD = 5; // Failed attempts before lockout
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const SESSION_DURATION_REGULAR = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_DURATION_REMEMBER = 30 * 24 * 60 * 60 * 1000; // 30 days
const TOKEN_EXPIRY_EMAIL = 24 * 60 * 60 * 1000; // 24 hours
const TOKEN_EXPIRY_PASSWORD = 60 * 60 * 1000; // 1 hour

export class AuthService {
  constructor(private storage: any) {}

  // Password utilities
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Token generation
  generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Account lockout utilities
  async isAccountLocked(user: User): Promise<boolean> {
    if (!user.accountLockedUntil) return false;
    return new Date() < new Date(user.accountLockedUntil);
  }

  async recordFailedLogin(userId: string): Promise<void> {
    const user = await this.storage.getUserById(userId);
    if (!user) return;

    const attempts = parseInt(user.failedLoginAttempts || '0') + 1;
    
    const updates: any = {
      failedLoginAttempts: attempts.toString(),
    };

    // Lock account if threshold reached
    if (attempts >= LOCKOUT_THRESHOLD) {
      updates.accountLockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
    }

    await this.storage.updateUser(userId, updates);
  }

  async clearFailedLogins(userId: string): Promise<void> {
    await this.storage.updateUser(userId, {
      failedLoginAttempts: '0',
      accountLockedUntil: null,
      lastLoginAt: new Date(),
    });
  }

  // Email verification
  async generateEmailVerificationToken(email: string): Promise<string> {
    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_EMAIL);

    await this.storage.createEmailVerificationToken({
      email,
      token,
      expiresAt,
    });

    return token;
  }

  async verifyEmailToken(token: string): Promise<string | null> {
    const tokenRecord = await this.storage.getEmailVerificationToken(token);
    
    if (!tokenRecord || new Date() > new Date(tokenRecord.expiresAt)) {
      return null;
    }

    // Mark user as verified
    await this.storage.updateUserByEmail(tokenRecord.email, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    // Clean up token
    await this.storage.deleteEmailVerificationToken(token);
    
    return tokenRecord.email;
  }

  // Password reset
  async generatePasswordResetToken(userId: string): Promise<string> {
    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_PASSWORD);

    await this.storage.createPasswordResetToken({
      userId,
      token,
      used: false,
      expiresAt,
    });

    return token;
  }

  async validatePasswordResetToken(token: string): Promise<string | null> {
    const tokenRecord = await this.storage.getPasswordResetToken(token);
    
    if (!tokenRecord || tokenRecord.used || new Date() > new Date(tokenRecord.expiresAt)) {
      return null;
    }

    return tokenRecord.userId;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const userId = await this.validatePasswordResetToken(token);
    if (!userId) return false;

    const passwordHash = await this.hashPassword(newPassword);
    
    // Update password and mark token as used
    await this.storage.updateUser(userId, {
      passwordHash,
      failedLoginAttempts: '0',
      accountLockedUntil: null,
    });

    await this.storage.markPasswordResetTokenUsed(token);
    
    return true;
  }

  // Session management
  async createSession(userId: string, rememberMe: boolean, deviceInfo?: string, ipAddress?: string): Promise<string> {
    const sessionToken = this.generateSecureToken();
    const duration = rememberMe ? SESSION_DURATION_REMEMBER : SESSION_DURATION_REGULAR;
    const expiresAt = new Date(Date.now() + duration);

    await this.storage.createUserSession({
      userId,
      sessionToken,
      deviceInfo: deviceInfo || 'Unknown device',
      ipAddress,
      expiresAt,
    });

    return sessionToken;
  }

  async validateSession(sessionToken: string): Promise<User | null> {
    const session = await this.storage.getUserSession(sessionToken);
    
    if (!session || new Date() > new Date(session.expiresAt)) {
      if (session) {
        await this.storage.deleteUserSession(session.id);
      }
      return null;
    }

    // Update last active
    await this.storage.updateUserSession(session.id, {
      lastActive: new Date(),
    });

    return this.storage.getUserById(session.userId);
  }

  async revokeSession(sessionToken: string): Promise<void> {
    await this.storage.deleteUserSessionByToken(sessionToken);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.storage.deleteAllUserSessions(userId);
  }

  // MFA utilities
  generateMFASecret(): { secret: string; qrCode: string } {
    const secret = speakeasy.generateSecret({
      name: 'HiPo AI Coach',
      issuer: 'HiPo AI',
    });

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || '',
    };
  }

  verifyMFAToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      token,
      window: 2, // Allow 2 steps of variance
    });
  }

  // Main authentication methods
  async signUp(input: SignUpInput): Promise<{ user: User; verificationToken: string }> {
    // Check if user already exists
    const existingUser = await this.storage.getUserByEmail(input.email);
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(input.password);

    // Create user
    const userData = {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      emailVerified: false,
      termsAccepted: input.termsAccepted,
      termsAcceptedAt: new Date(),
      privacyAccepted: input.privacyAccepted,
      privacyAcceptedAt: new Date(),
      isActive: true,
    };

    const user = await this.storage.createUser(userData);

    // Generate email verification token
    const verificationToken = await this.generateEmailVerificationToken(input.email);

    return { user, verificationToken };
  }

  async signIn(input: SignInInput, deviceInfo?: string, ipAddress?: string): Promise<{ user: User; sessionToken: string }> {
    const user = await this.storage.getUserByEmail(input.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if account is locked
    if (await this.isAccountLocked(user)) {
      throw new Error('Account is temporarily locked due to too many failed attempts');
    }

    // Validate password
    if (!user.passwordHash || !(await this.validatePassword(input.password, user.passwordHash))) {
      await this.recordFailedLogin(user.id);
      throw new Error('Invalid email or password');
    }

    // Check if email is verified (optional for MVP, can be enforced later)
    if (!user.emailVerified) {
      // For now, we'll allow sign-in but should prompt for verification
      console.warn(`User ${user.email} signing in with unverified email`);
    }

    // Clear failed login attempts
    await this.clearFailedLogins(user.id);

    // Create session
    const sessionToken = await this.createSession(user.id, input.rememberMe, deviceInfo, ipAddress);

    return { user, sessionToken };
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.storage.getUserById(userId);
    if (!user || !user.passwordHash) {
      throw new Error('User not found');
    }

    // Validate current password
    if (!(await this.validatePassword(input.currentPassword, user.passwordHash))) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await this.hashPassword(input.newPassword);

    // Update password
    await this.storage.updateUser(userId, { passwordHash });

    // Revoke all sessions (force re-login for security)
    await this.revokeAllUserSessions(userId);
  }

  async requestPasswordReset(input: ForgotPasswordInput): Promise<string | null> {
    const user = await this.storage.getUserByEmail(input.email);
    if (!user) {
      // Don't reveal if email exists for security
      return null;
    }

    return this.generatePasswordResetToken(user.id);
  }

  async deleteAccount(userId: string): Promise<{ exportData: any }> {
    const user = await this.storage.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Gather user data for export
    const sessions = await this.storage.getCoachingSessionsByUserId(userId);
    const savedAdvice = await this.storage.getSavedAdviceByUserId(userId);
    
    const exportData = {
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currentRole: user.currentRole,
        industry: user.industry,
        careerStage: user.careerStage,
        createdAt: user.createdAt,
      },
      coachingSessions: sessions,
      savedAdvice: savedAdvice,
      exportedAt: new Date().toISOString(),
    };

    // Delete user data (CASCADE should handle related data)
    await this.storage.deleteUser(userId);

    return { exportData };
  }
}