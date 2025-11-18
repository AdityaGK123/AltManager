-- Create moment_diagnostics table
-- This table is used for performance monitoring of moment endpoints

-- First, create the diagnostic_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE diagnostic_status AS ENUM ('success', 'error', 'timeout', 'retry');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the moment_diagnostics table
CREATE TABLE IF NOT EXISTS moment_diagnostics (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    status diagnostic_status NOT NULL,
    duration_ms INTEGER NOT NULL,
    error_message TEXT,
    user_id INTEGER,
    metadata JSONB,
    logged_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_moment_diagnostics_slug ON moment_diagnostics(slug);
CREATE INDEX IF NOT EXISTS idx_moment_diagnostics_logged_at ON moment_diagnostics(logged_at);
CREATE INDEX IF NOT EXISTS idx_moment_diagnostics_status ON moment_diagnostics(status);

-- Verify table was created
SELECT 
    'moment_diagnostics table created successfully' AS message,
    COUNT(*) AS row_count 
FROM moment_diagnostics;
