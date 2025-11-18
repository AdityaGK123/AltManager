import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users, userProfiles } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
});

// Register
router.post('/register', authLimiter, async (req, res) => {
  console.log('📝 Registration attempt:', { email: req.body?.email, hasPassword: !!req.body?.password, name: req.body?.name });
  
  try {
    // Validate JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('❌ CRITICAL: JWT_SECRET not set in environment');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const { email, password, name } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    console.log('🔍 Checking if user exists:', email);
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      console.log('❌ User already exists');
      return res.status(400).json({ error: 'User already exists' });
    }
    console.log('✅ User does not exist, proceeding with registration');

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed successfully');

    // Create user - adapt to existing schema
    console.log('💾 Inserting user into database...');
    const userData = {
      email,
      password: passwordHash,
      firstName: name || 'User',
      lastName: '',
      role: 'user',
      experience: 0,
    };
    console.log('User data:', { ...userData, password: '[REDACTED]' });
    
    const [newUser] = await db.insert(users).values(userData).returning();
    console.log('✅ User created with ID:', newUser.id);

    // Create user profile
    console.log('📋 Creating user profile...');
    await db.insert(userProfiles).values({
      userId: newUser.id,
    });
    console.log('✅ User profile created');

    // Generate token
    console.log('🎫 Generating JWT token...');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const token = jwt.sign(
      { userId: newUser.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
    console.log('✅ JWT token generated');

    console.log('✅ Registration successful, sending response');
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.firstName} ${newUser.lastName}`.trim(),
      },
    });
  } catch (error: any) {
    console.error('❌ ========================================');
    console.error('❌ REGISTRATION ERROR');
    console.error('❌ ========================================');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    console.error('❌ ========================================');
    
    // Check if response already sent
    if (res.headersSent) {
      console.error('⚠️  Response already sent, cannot send error response');
      return;
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code
    });
  }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password - adapt to existing schema
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
