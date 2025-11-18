-- Create Optional Tables for Advanced Features
-- Run this when you're ready to enable analytics and habit tracking

-- 1. Habits Table (for habit tracking feature)
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50),
    streak INTEGER DEFAULT 0,
    last_completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- 2. MoM Records Table (for meeting minutes)
CREATE TABLE IF NOT EXISTS mom_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    summary TEXT NOT NULL,
    development_areas JSONB,
    emotional_tone VARCHAR(100),
    action_items JSONB,
    insights JSONB,
    blindspots JSONB,
    raw_transcript TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mom_records_user_id ON mom_records(user_id);
CREATE INDEX IF NOT EXISTS idx_mom_records_date ON mom_records(date);

-- 3. Trend Analysis Table (for analytics)
CREATE TABLE IF NOT EXISTS trend_analysis (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP NOT NULL DEFAULT NOW(),
    primary_development_areas JSONB,
    content_theme_clusters JSONB,
    emotional_trajectory JSONB,
    summary_insights JSONB,
    mom_count INTEGER DEFAULT 0,
    date_range JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trend_analysis_user_id ON trend_analysis(user_id);

-- 4. Blindspot Analysis Table (for deep insights)
CREATE TABLE IF NOT EXISTS blindspot_analysis (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP NOT NULL DEFAULT NOW(),
    recurring_blindspots JSONB,
    what_remains_unsaid JSONB,
    operating_assumptions JSONB,
    unrecognized_strengths JSONB,
    growth_blockers JSONB,
    meta_patterns JSONB,
    development_hypotheses JSONB,
    mom_count INTEGER DEFAULT 0,
    date_range JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blindspot_analysis_user_id ON blindspot_analysis(user_id);

-- 5. Progress Analysis Table (for progress tracking)
CREATE TABLE IF NOT EXISTS progress_analysis (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP NOT NULL DEFAULT NOW(),
    key_themes JSONB,
    movement_on_areas JSONB,
    action_item_evolution JSONB,
    mindset_shifts JSONB,
    capability_building JSONB,
    small_wins JSONB,
    stuck_points JSONB,
    overall_trajectory TEXT,
    progress_scores JSONB,
    mom_count INTEGER DEFAULT 0,
    date_range JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_analysis_user_id ON progress_analysis(user_id);

-- Verify all tables created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('habits', 'mom_records', 'trend_analysis', 'blindspot_analysis', 'progress_analysis')
ORDER BY table_name;
