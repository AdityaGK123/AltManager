-- Manager Moments Extended Schema
-- Adds tables for completions, debriefs, peer examples, and practice loops

-- Extend manager_moments table with new metadata (only if columns don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manager_moments' AND column_name='skill_focus') THEN
    ALTER TABLE manager_moments ADD COLUMN skill_focus VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manager_moments' AND column_name='expected_turns') THEN
    ALTER TABLE manager_moments ADD COLUMN expected_turns INTEGER DEFAULT 3;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manager_moments' AND column_name='cluster') THEN
    ALTER TABLE manager_moments ADD COLUMN cluster VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manager_moments' AND column_name='safety_framing') THEN
    ALTER TABLE manager_moments ADD COLUMN safety_framing TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manager_moments' AND column_name='caselet') THEN
    ALTER TABLE manager_moments ADD COLUMN caselet TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manager_moments' AND column_name='roleplay_config') THEN
    ALTER TABLE manager_moments ADD COLUMN roleplay_config JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='manager_moments' AND column_name='rubric') THEN
    ALTER TABLE manager_moments ADD COLUMN rubric JSONB;
  END IF;
END $$;

-- Moment Completions table (tracks each attempt)
CREATE TABLE IF NOT EXISTS moment_completions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  moment_id INTEGER NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  turn_count INTEGER DEFAULT 0,
  transcript JSONB,
  status VARCHAR(50) DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add foreign keys only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moment_completions_user_id_fkey') THEN
    ALTER TABLE moment_completions ADD CONSTRAINT moment_completions_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moment_completions_moment_id_fkey') THEN
    ALTER TABLE moment_completions ADD CONSTRAINT moment_completions_moment_id_fkey 
      FOREIGN KEY (moment_id) REFERENCES manager_moments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Moment Debriefs table (stores rubric scores and feedback)
CREATE TABLE IF NOT EXISTS moment_debriefs (
  id SERIAL PRIMARY KEY,
  completion_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  moment_id INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 4),
  evidence_quotes JSONB,
  strengths JSONB,
  improvements JSONB,
  exemplar_rewrite TEXT,
  micro_habit TEXT,
  templates JSONB,
  rubric_scores JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add foreign keys for debriefs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moment_debriefs_completion_id_fkey') THEN
    ALTER TABLE moment_debriefs ADD CONSTRAINT moment_debriefs_completion_id_fkey 
      FOREIGN KEY (completion_id) REFERENCES moment_completions(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moment_debriefs_user_id_fkey') THEN
    ALTER TABLE moment_debriefs ADD CONSTRAINT moment_debriefs_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moment_debriefs_moment_id_fkey') THEN
    ALTER TABLE moment_debriefs ADD CONSTRAINT moment_debriefs_moment_id_fkey 
      FOREIGN KEY (moment_id) REFERENCES manager_moments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Peer Examples table (anonymized examples for learning)
CREATE TABLE IF NOT EXISTS moment_peer_examples (
  id SERIAL PRIMARY KEY,
  moment_id INTEGER NOT NULL REFERENCES manager_moments(id) ON DELETE CASCADE,
  example_text TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 4),
  what_worked TEXT,
  context VARCHAR(255),
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Practice Loop Variants table (harder/easier versions)
CREATE TABLE IF NOT EXISTS moment_practice_variants (
  id SERIAL PRIMARY KEY,
  base_moment_id INTEGER NOT NULL REFERENCES manager_moments(id) ON DELETE CASCADE,
  variant_type VARCHAR(50) NOT NULL, -- 'harder', 'easier', 'alternative'
  caselet TEXT NOT NULL,
  roleplay_config JSONB,
  difficulty_modifier INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_moment_completions_user_id ON moment_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_moment_completions_moment_id ON moment_completions(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_completions_session_id ON moment_completions(session_id);
CREATE INDEX IF NOT EXISTS idx_moment_debriefs_user_id ON moment_debriefs(user_id);
CREATE INDEX IF NOT EXISTS idx_moment_debriefs_moment_id ON moment_debriefs(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_peer_examples_moment_id ON moment_peer_examples(moment_id);

-- Add comments
COMMENT ON TABLE moment_completions IS 'Tracks each user attempt at a manager moment with full transcript';
COMMENT ON TABLE moment_debriefs IS 'Stores rubric-based feedback and scores for completed moments';
COMMENT ON TABLE moment_peer_examples IS 'Anonymized peer examples for learning';
COMMENT ON TABLE moment_practice_variants IS 'Harder/easier variants for practice loops';
