-- Create user_moments table for tracking user progress on Manager Moments
-- This table stores the overall progress state for each user-moment combination

-- Create moment_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE moment_status AS ENUM ('not_started', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_moments table
CREATE TABLE IF NOT EXISTS user_moments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    moment_id VARCHAR(255) NOT NULL,
    status moment_status DEFAULT 'not_started',
    score INTEGER,
    feedback JSONB,
    attempts INTEGER DEFAULT 0,
    last_practiced_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    
    -- Ensure one record per user-moment combination
    UNIQUE(user_id, moment_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_moments_user_id ON user_moments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_moments_moment_id ON user_moments(moment_id);
CREATE INDEX IF NOT EXISTS idx_user_moments_status ON user_moments(status);
CREATE INDEX IF NOT EXISTS idx_user_moments_user_moment ON user_moments(user_id, moment_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_moments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_moments_updated_at ON user_moments;
CREATE TRIGGER trigger_user_moments_updated_at
    BEFORE UPDATE ON user_moments
    FOR EACH ROW
    EXECUTE FUNCTION update_user_moments_updated_at();

-- Add comment
COMMENT ON TABLE user_moments IS 'Tracks user progress and completion status for Manager Moments';
