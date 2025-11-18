-- Manager Moments - Create supporting tables only
-- Note: manager_moments table already exists with different schema

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS moment_debriefs CASCADE;
DROP TABLE IF EXISTS moment_completions CASCADE;
DROP TABLE IF EXISTS moment_peer_examples CASCADE;
DROP TABLE IF EXISTS moment_practice_variants CASCADE;

-- Moment Completions table (tracks each attempt)
CREATE TABLE moment_completions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  moment_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  turn_count INTEGER DEFAULT 0,
  transcript JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Moment Debriefs table (stores rubric scores and feedback)
CREATE TABLE moment_debriefs (
  id SERIAL PRIMARY KEY,
  completion_id INTEGER NOT NULL REFERENCES moment_completions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL,
  moment_id VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 4),
  evidence_quotes JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  exemplar_rewrite TEXT,
  micro_habit TEXT,
  templates JSONB DEFAULT '[]'::jsonb,
  rubric_scores JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Peer Examples table (anonymized examples for learning)
CREATE TABLE moment_peer_examples (
  id SERIAL PRIMARY KEY,
  moment_id VARCHAR(255) NOT NULL,
  example_text TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 4),
  what_worked TEXT,
  context VARCHAR(255),
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Practice Loop Variants table
CREATE TABLE moment_practice_variants (
  id SERIAL PRIMARY KEY,
  base_moment_id VARCHAR(255) NOT NULL,
  variant_type VARCHAR(50) NOT NULL,
  caselet TEXT NOT NULL,
  roleplay_config JSONB,
  difficulty_modifier INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_moment_completions_user_id ON moment_completions(user_id);
CREATE INDEX idx_moment_completions_moment_id ON moment_completions(moment_id);
CREATE INDEX idx_moment_completions_session_id ON moment_completions(session_id);
CREATE INDEX idx_moment_debriefs_user_id ON moment_debriefs(user_id);
CREATE INDEX idx_moment_debriefs_moment_id ON moment_debriefs(moment_id);
CREATE INDEX idx_moment_peer_examples_moment_id ON moment_peer_examples(moment_id);

-- Add comments
COMMENT ON TABLE moment_completions IS 'Tracks each user attempt at a manager moment with full transcript';
COMMENT ON TABLE moment_debriefs IS 'Stores rubric-based feedback and scores for completed moments';
COMMENT ON TABLE moment_peer_examples IS 'Anonymized peer examples for learning';
COMMENT ON TABLE moment_practice_variants IS 'Harder/easier variants for practice loops';
