-- Conversational Coaching System Tables
-- Adds feedback tracking, badges, XP, and analytics for Manager Moments

-- User Moment Feedback (stores detailed rubric-based feedback for each practice)
CREATE TABLE IF NOT EXISTS user_moment_feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moment_id VARCHAR(255) NOT NULL,
  completion_id INTEGER REFERENCES moment_completions(id) ON DELETE CASCADE,
  rubric JSONB NOT NULL, -- Detailed rubric scores
  feedback TEXT NOT NULL, -- Natural language coaching feedback
  manager_tone TEXT, -- Tone of the feedback (encouraging, direct, etc.)
  category VARCHAR(100) NOT NULL, -- Communication, Organization, Collaboration, Growth, Deadlines
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_moment_feedback_user ON user_moment_feedback(user_id);
CREATE INDEX idx_user_moment_feedback_moment ON user_moment_feedback(moment_id);
CREATE INDEX idx_user_moment_feedback_category ON user_moment_feedback(category);
CREATE INDEX idx_user_moment_feedback_created ON user_moment_feedback(created_at DESC);

-- User Badges (achievement system for skill milestones)
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_name VARCHAR(255) NOT NULL,
  badge_slug VARCHAR(255) NOT NULL,
  level VARCHAR(50) NOT NULL, -- bronze, silver, gold, platinum
  category VARCHAR(100) NOT NULL, -- Communication, Organization, etc.
  description TEXT,
  icon VARCHAR(100), -- Icon identifier
  xp_value INTEGER DEFAULT 0,
  achieved_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_category ON user_badges(category);
CREATE INDEX idx_user_badges_level ON user_badges(level);

-- User XP and Level Tracking (gamification)
CREATE TABLE IF NOT EXISTS user_xp_tracking (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  xp_to_next_level INTEGER DEFAULT 100,
  category_xp JSONB DEFAULT '{}', -- XP breakdown by category
  streak_days INTEGER DEFAULT 0,
  last_practice_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_xp_tracking_user ON user_xp_tracking(user_id);
CREATE INDEX idx_user_xp_tracking_level ON user_xp_tracking(current_level DESC);

-- Insight Timeline (tracks improvement over time)
CREATE TABLE IF NOT EXISTS user_insight_timeline (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moment_id VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  insight_type VARCHAR(50) NOT NULL, -- improvement, milestone, streak, badge
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB, -- Additional context (score change, badge earned, etc.)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_insight_timeline_user ON user_insight_timeline(user_id);
CREATE INDEX idx_user_insight_timeline_created ON user_insight_timeline(created_at DESC);
CREATE INDEX idx_user_insight_timeline_category ON user_insight_timeline(category);

-- Conversation Memory (stores last N sessions per category for personalization)
CREATE TABLE IF NOT EXISTS conversation_memory (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  moment_id VARCHAR(255) NOT NULL,
  session_summary TEXT, -- Brief summary of the session
  key_learnings JSONB, -- Array of key learnings
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversation_memory_user_category ON conversation_memory(user_id, category);
CREATE INDEX idx_conversation_memory_created ON conversation_memory(created_at DESC);

-- Add constraint to keep only last 5 sessions per user per category
-- This will be enforced in application logic for performance

-- Badge Definitions (master list of available badges)
CREATE TABLE IF NOT EXISTS badge_definitions (
  id SERIAL PRIMARY KEY,
  badge_slug VARCHAR(255) NOT NULL UNIQUE,
  badge_name VARCHAR(255) NOT NULL,
  level VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100),
  criteria JSONB NOT NULL, -- Requirements to earn (e.g., {"completions": 3, "min_score": 70})
  xp_value INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_badge_definitions_category ON badge_definitions(category);
CREATE INDEX idx_badge_definitions_level ON badge_definitions(level);

-- Insert default badge definitions
INSERT INTO badge_definitions (badge_slug, badge_name, level, category, description, icon, criteria, xp_value) VALUES
  ('focused-communicator', 'Focused Communicator', 'bronze', 'Communication', 'Complete 3 communication moments with >70% score', '🥉', '{"completions": 3, "min_score": 70}', 50),
  ('insightful-coach', 'Insightful Coach', 'silver', 'Communication', 'Complete 5 communication moments with >80% score', '🥈', '{"completions": 5, "min_score": 80}', 100),
  ('decision-maker', 'Decision Maker', 'gold', 'Communication', 'Complete 10 communication moments with >90% score', '🥇', '{"completions": 10, "min_score": 90}', 200),
  
  ('organized-planner', 'Organized Planner', 'bronze', 'Organization', 'Complete 3 organization moments with >70% score', '📋', '{"completions": 3, "min_score": 70}', 50),
  ('systems-thinker', 'Systems Thinker', 'silver', 'Organization', 'Complete 5 organization moments with >80% score', '⚙️', '{"completions": 5, "min_score": 80}', 100),
  ('productivity-master', 'Productivity Master', 'gold', 'Organization', 'Complete 10 organization moments with >90% score', '🎯', '{"completions": 10, "min_score": 90}', 200),
  
  ('team-collaborator', 'Team Collaborator', 'bronze', 'Collaboration', 'Complete 3 collaboration moments with >70% score', '🤝', '{"completions": 3, "min_score": 70}', 50),
  ('bridge-builder', 'Bridge Builder', 'silver', 'Collaboration', 'Complete 5 collaboration moments with >80% score', '🌉', '{"completions": 5, "min_score": 80}', 100),
  ('collaboration-champion', 'Collaboration Champion', 'gold', 'Collaboration', 'Complete 10 collaboration moments with >90% score', '👥', '{"completions": 10, "min_score": 90}', 200),
  
  ('growth-seeker', 'Growth Seeker', 'bronze', 'Growth', 'Complete 3 growth moments with >70% score', '🌱', '{"completions": 3, "min_score": 70}', 50),
  ('feedback-champion', 'Feedback Champion', 'silver', 'Growth', 'Complete 5 growth moments with >80% score', '💪', '{"completions": 5, "min_score": 80}', 100),
  ('continuous-learner', 'Continuous Learner', 'gold', 'Growth', 'Complete 10 growth moments with >90% score', '🚀', '{"completions": 10, "min_score": 90}', 200),
  
  ('deadline-defender', 'Deadline Defender', 'bronze', 'Deadlines', 'Complete 3 deadline moments with >70% score', '⏰', '{"completions": 3, "min_score": 70}', 50),
  ('time-master', 'Time Master', 'silver', 'Deadlines', 'Complete 5 deadline moments with >80% score', '⌛', '{"completions": 5, "min_score": 80}', 100),
  ('execution-expert', 'Execution Expert', 'gold', 'Deadlines', 'Complete 10 deadline moments with >90% score', '⚡', '{"completions": 10, "min_score": 90}', 200),
  
  ('seven-day-streak', '7-Day Streak', 'bronze', 'Engagement', 'Practice for 7 consecutive days', '🔥', '{"streak_days": 7}', 75),
  ('thirty-day-streak', '30-Day Streak', 'silver', 'Engagement', 'Practice for 30 consecutive days', '🔥🔥', '{"streak_days": 30}', 150),
  ('perfect-scorer', 'Perfect Scorer', 'gold', 'Achievement', 'Score 100% on any moment', '💯', '{"perfect_score": 1}', 100),
  ('improvement-champion', 'Improvement Champion', 'silver', 'Achievement', 'Improve score by 30% on retry', '📈', '{"improvement_percent": 30}', 100)
ON CONFLICT (badge_slug) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE user_moment_feedback IS 'Stores detailed rubric-based feedback for each moment practice session';
COMMENT ON TABLE user_badges IS 'Tracks badges earned by users for achieving milestones';
COMMENT ON TABLE user_xp_tracking IS 'Tracks user XP, levels, and streaks for gamification';
COMMENT ON TABLE user_insight_timeline IS 'Timeline of user improvements, milestones, and achievements';
COMMENT ON TABLE conversation_memory IS 'Stores recent session summaries for personalized coaching context';
COMMENT ON TABLE badge_definitions IS 'Master list of available badges and their criteria';
