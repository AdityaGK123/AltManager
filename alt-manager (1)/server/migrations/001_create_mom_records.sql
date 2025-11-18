-- Migration: Create mom_records table for Minutes of Meeting
-- Date: 2025-10-18
-- Purpose: Enable automatic MoM generation and storage

-- Create mom_records table if it doesn't exist
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mom_records_user_id ON mom_records(user_id);
CREATE INDEX IF NOT EXISTS idx_mom_records_conversation_id ON mom_records(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mom_records_date ON mom_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_mom_records_created_at ON mom_records(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE mom_records IS 'Stores automatically generated Minutes of Meeting from chat conversations';
COMMENT ON COLUMN mom_records.development_areas IS 'Array of skill/area tags identified for development';
COMMENT ON COLUMN mom_records.action_items IS 'Array of 3 actionable items from the conversation';
COMMENT ON COLUMN mom_records.insights IS 'Array of 3 key insights and takeaways';
COMMENT ON COLUMN mom_records.blindspots IS 'Array of 2-3 potential blindspots or areas to watch';
COMMENT ON COLUMN mom_records.raw_transcript IS 'Original conversation transcript for reference';
