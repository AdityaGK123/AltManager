import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function createTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create enums first
    console.log('Creating enums...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE manager_tone AS ENUM ('supportive', 'direct', 'balanced');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE achievement_tier AS ENUM ('bronze', 'silver', 'gold');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE moment_status AS ENUM ('not_started', 'in_progress', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('✅ Enums created');

    // Create users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Users table created');

    // Create user_profiles table
    console.log('Creating user_profiles table...');
    await client.query(`
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
    `);
    console.log('✅ User profiles table created');

    // Create other tables
    await client.query(`CREATE TABLE IF NOT EXISTS skills (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, name VARCHAR(255) NOT NULL, category VARCHAR(100), current_level INTEGER DEFAULT 0, target_level INTEGER DEFAULT 100, progress INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL);`);
    console.log('✅ Skills table created');

    await client.query(`CREATE TABLE IF NOT EXISTS goals (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, title VARCHAR(255) NOT NULL, description TEXT, target_date TIMESTAMP, completed BOOLEAN DEFAULT false, progress INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL);`);
    console.log('✅ Goals table created');

    await client.query(`CREATE TABLE IF NOT EXISTS achievements (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, title VARCHAR(255) NOT NULL, description TEXT, tier achievement_tier NOT NULL, icon VARCHAR(100), earned_at TIMESTAMP DEFAULT NOW() NOT NULL);`);
    console.log('✅ Achievements table created');

    await client.query(`CREATE TABLE IF NOT EXISTS conversations (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, title VARCHAR(255), created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL);`);
    console.log('✅ Conversations table created');

    await client.query(`CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, conversation_id INTEGER REFERENCES conversations(id) NOT NULL, role VARCHAR(50) NOT NULL, content TEXT NOT NULL, metadata JSONB, created_at TIMESTAMP DEFAULT NOW() NOT NULL);`);
    console.log('✅ Messages table created');

    await client.query(`CREATE TABLE IF NOT EXISTS manager_moments (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT NOT NULL, scenario TEXT NOT NULL, artifact JSONB, category VARCHAR(100), difficulty INTEGER DEFAULT 1, learning_objectives JSONB, created_at TIMESTAMP DEFAULT NOW() NOT NULL);`);
    console.log('✅ Manager moments table created');

    await client.query(`CREATE TABLE IF NOT EXISTS user_moments (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, moment_id INTEGER REFERENCES manager_moments(id) NOT NULL, status moment_status DEFAULT 'not_started', score INTEGER, feedback JSONB, completed_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL);`);
    console.log('✅ User moments table created');

    await client.query(`CREATE TABLE IF NOT EXISTS habits (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, title VARCHAR(255) NOT NULL, description TEXT, frequency VARCHAR(50), streak INTEGER DEFAULT 0, last_completed_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL);`);
    console.log('✅ Habits table created');

    await client.query(`CREATE TABLE IF NOT EXISTS saved_recommendations (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, content TEXT NOT NULL, category VARCHAR(100), source VARCHAR(100), created_at TIMESTAMP DEFAULT NOW() NOT NULL);`);
    console.log('✅ Saved recommendations table created');

    console.log('\n🎉 All tables created successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

createTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
