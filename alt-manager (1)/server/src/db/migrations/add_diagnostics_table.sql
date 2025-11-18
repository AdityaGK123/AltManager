-- Create diagnostic_status enum
DO $$ BEGIN
    CREATE TYPE diagnostic_status AS ENUM ('success', 'error', 'timeout', 'retry');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create moment_diagnostics table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_moment_diagnostics_slug ON moment_diagnostics(slug);
CREATE INDEX IF NOT EXISTS idx_moment_diagnostics_logged_at ON moment_diagnostics(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_moment_diagnostics_status ON moment_diagnostics(status);
CREATE INDEX IF NOT EXISTS idx_moment_diagnostics_endpoint ON moment_diagnostics(endpoint);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_moment_diagnostics_slug_logged_at 
    ON moment_diagnostics(slug, logged_at DESC);

COMMENT ON TABLE moment_diagnostics IS 'Performance monitoring and diagnostics for moment API calls';
COMMENT ON COLUMN moment_diagnostics.slug IS 'Moment identifier (ID or slug)';
COMMENT ON COLUMN moment_diagnostics.endpoint IS 'API endpoint that was called';
COMMENT ON COLUMN moment_diagnostics.status IS 'Request status: success, error, timeout, or retry';
COMMENT ON COLUMN moment_diagnostics.duration_ms IS 'Request duration in milliseconds';
COMMENT ON COLUMN moment_diagnostics.error_message IS 'Error message if status is error';
COMMENT ON COLUMN moment_diagnostics.user_id IS 'User who made the request (optional)';
COMMENT ON COLUMN moment_diagnostics.metadata IS 'Additional context (JSON)';
COMMENT ON COLUMN moment_diagnostics.logged_at IS 'Timestamp when diagnostic was logged';
