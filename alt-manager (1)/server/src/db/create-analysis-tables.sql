-- Create analysis tables for ALT Manager

-- Minutes of Meeting (MoM) Records table
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
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Trend Analysis table
CREATE TABLE IF NOT EXISTS trend_analysis (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP DEFAULT NOW() NOT NULL,
  primary_development_areas JSONB,
  content_theme_clusters JSONB,
  emotional_trajectory JSONB,
  summary_insights JSONB,
  mom_count INTEGER DEFAULT 0,
  date_range JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Blindspot Analysis table
CREATE TABLE IF NOT EXISTS blindspot_analysis (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP DEFAULT NOW() NOT NULL,
  recurring_blindspots JSONB,
  what_remains_unsaid JSONB,
  operating_assumptions JSONB,
  unrecognized_strengths JSONB,
  growth_blockers JSONB,
  meta_patterns JSONB,
  development_hypotheses JSONB,
  mom_count INTEGER DEFAULT 0,
  date_range JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Progress Analysis table
CREATE TABLE IF NOT EXISTS progress_analysis (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP DEFAULT NOW() NOT NULL,
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
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mom_records_user_id ON mom_records(user_id);
CREATE INDEX IF NOT EXISTS idx_mom_records_date ON mom_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_user_id ON trend_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_blindspot_analysis_user_id ON blindspot_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_analysis_user_id ON progress_analysis(user_id);

-- Add comments for documentation
COMMENT ON TABLE mom_records IS 'Stores Minutes of Meeting generated from user-AI conversations';
COMMENT ON TABLE trend_analysis IS 'Stores recurring themes and emotional trends analysis';
COMMENT ON TABLE blindspot_analysis IS 'Stores blindspot deep-dive analysis results';
COMMENT ON TABLE progress_analysis IS 'Stores progress tracking and theme-based analysis';
