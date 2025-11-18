import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import * as schema from './schema.js';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function initDatabase() {
  console.log('🔄 Initializing database...');
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Create tables using raw SQL
    await client.query(`
      -- Create enums
      DO $$ BEGIN
        CREATE TYPE manager_tone AS ENUM ('supportive', 'direct', 'balanced');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE achievement_tier AS ENUM ('bronze', 'silver', 'gold');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE moment_status AS ENUM ('not_started', 'in_progress', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create user_profiles table
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL UNIQUE,
        role_title VARCHAR(255),
        experience_years INTEGER DEFAULT 0,
        career_goals TEXT,
        current_challenges TEXT,
        manager_tone manager_tone DEFAULT 'balanced',
        onboarding_completed BOOLEAN DEFAULT false,
        level INTEGER DEFAULT 1,
        experience_points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create skills table
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        current_level INTEGER DEFAULT 0,
        target_level INTEGER DEFAULT 100,
        progress INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create goals table
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_date TIMESTAMP,
        completed BOOLEAN DEFAULT false,
        progress INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create achievements table
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        tier achievement_tier NOT NULL,
        icon VARCHAR(100),
        earned_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create conversations table
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create messages table
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) NOT NULL,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create manager_moments table
      CREATE TABLE IF NOT EXISTS manager_moments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        scenario TEXT NOT NULL,
        artifact JSONB,
        category VARCHAR(100),
        difficulty INTEGER DEFAULT 1,
        learning_objectives JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create user_moments table
      CREATE TABLE IF NOT EXISTS user_moments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        moment_id INTEGER REFERENCES manager_moments(id) NOT NULL,
        status moment_status DEFAULT 'not_started',
        score INTEGER,
        feedback JSONB,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create habits table
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        frequency VARCHAR(50),
        streak INTEGER DEFAULT 0,
        last_completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create saved_recommendations table
      CREATE TABLE IF NOT EXISTS saved_recommendations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100),
        source VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log('✅ All tables created successfully!');
    client.release();
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

initDatabase()
  .then(() => {
    console.log('🎉 Database initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
