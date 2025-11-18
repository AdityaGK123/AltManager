-- Create analytics tables if they don't exist

-- Trend Analysis table
CREATE TABLE IF NOT EXISTS trend_analysis (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP NOT NULL DEFAULT NOW(),
  primary_development_areas JSONB,
  content_theme_clusters JSONB,
  emotional_trajectory JSONB,
  summary_insights JSONB,
  mom_count INTEGER NOT NULL DEFAULT 0,
  date_range JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Blindspot Analysis table
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
  mom_count INTEGER NOT NULL DEFAULT 0,
  date_range JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Progress Analysis table
CREATE TABLE IF NOT EXISTS progress_analysis (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP NOT NULL DEFAULT NOW(),
  key_themes JSONB,
  overall_trajectory TEXT,
  progress_scores JSONB,
  mom_count INTEGER NOT NULL DEFAULT 0,
  date_range JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trend_analysis_user_id ON trend_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_date ON trend_analysis(analysis_date DESC);

CREATE INDEX IF NOT EXISTS idx_blindspot_analysis_user_id ON blindspot_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_blindspot_analysis_date ON blindspot_analysis(analysis_date DESC);

CREATE INDEX IF NOT EXISTS idx_progress_analysis_user_id ON progress_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_analysis_date ON progress_analysis(analysis_date DESC);

-- Verify tables were created
SELECT 'trend_analysis' as table_name, COUNT(*) as row_count FROM trend_analysis
UNION ALL
SELECT 'blindspot_analysis', COUNT(*) FROM blindspot_analysis
UNION ALL
SELECT 'progress_analysis', COUNT(*) FROM progress_analysis;
