-- FINAL DATABASE SETUP FOR ALT MANAGER
-- Copy this entire script and run it in Neon SQL Editor

-- Step 1: Drop everything
DROP TABLE IF EXISTS saved_recommendations CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS user_moments CASCADE;
DROP TABLE IF EXISTS manager_moments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS moment_status CASCADE;
DROP TYPE IF EXISTS achievement_tier CASCADE;
DROP TYPE IF EXISTS manager_tone CASCADE;

-- Step 2: Create enums
CREATE TYPE manager_tone AS ENUM ('supportive', 'direct', 'balanced');
CREATE TYPE achievement_tier AS ENUM ('bronze', 'silver', 'gold');
CREATE TYPE moment_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Step 3: Create users table with correct schema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Step 4: Create user_profiles table
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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

-- Step 5: Create all other tables
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    current_level INTEGER DEFAULT 0,
    target_level INTEGER DEFAULT 100,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date TIMESTAMP,
    completed BOOLEAN DEFAULT false,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tier achievement_tier NOT NULL,
    icon VARCHAR(100),
    earned_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE manager_moments (
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

CREATE TABLE user_moments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    moment_id INTEGER NOT NULL REFERENCES manager_moments(id) ON DELETE CASCADE,
    status moment_status DEFAULT 'not_started',
    score INTEGER,
    feedback JSONB,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50),
    streak INTEGER DEFAULT 0,
    last_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE saved_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category VARCHAR(100),
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Verify tables were created
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'skills', COUNT(*) FROM skills
UNION ALL
SELECT 'goals', COUNT(*) FROM goals
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'manager_moments', COUNT(*) FROM manager_moments
UNION ALL
SELECT 'user_moments', COUNT(*) FROM user_moments
UNION ALL
SELECT 'habits', COUNT(*) FROM habits
UNION ALL
SELECT 'saved_recommendations', COUNT(*) FROM saved_recommendations;
