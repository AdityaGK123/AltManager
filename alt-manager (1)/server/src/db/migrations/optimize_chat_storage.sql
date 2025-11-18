-- Chat Storage Optimization Migration
-- Adds indexes, partitioning, and archival columns for cost-efficient storage

-- ============================================
-- PART 1: Add Indexes for High-Frequency Queries
-- ============================================

-- Conversations table indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id 
    ON conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user_created 
    ON conversations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_updated 
    ON conversations(updated_at DESC);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
    ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
    ON messages(conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_messages_created 
    ON messages(created_at DESC);

-- Composite index for pagination queries
CREATE INDEX IF NOT EXISTS idx_messages_conv_id_created 
    ON messages(conversation_id, id, created_at);

-- ============================================
-- PART 2: Add Archival Columns
-- ============================================

-- Add soft-delete and archival columns to conversations
ALTER TABLE conversations 
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP;

-- Add archival column to messages
ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

-- Create index on archival status
CREATE INDEX IF NOT EXISTS idx_conversations_archived 
    ON conversations(archived_at) 
    WHERE archived_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_deleted 
    ON conversations(deleted_at) 
    WHERE deleted_at IS NOT NULL;

-- ============================================
-- PART 3: Create Trigger for Message Count
-- ============================================

-- Function to update conversation metadata
CREATE OR REPLACE FUNCTION update_conversation_metadata()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE conversations 
        SET 
            message_count = message_count + 1,
            last_message_at = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.conversation_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE conversations 
        SET 
            message_count = GREATEST(message_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.conversation_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_conversation_metadata ON messages;
CREATE TRIGGER trigger_update_conversation_metadata
    AFTER INSERT OR DELETE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_metadata();

-- ============================================
-- PART 4: Backfill Existing Data
-- ============================================

-- Update message counts for existing conversations
UPDATE conversations c
SET 
    message_count = (
        SELECT COUNT(*) 
        FROM messages m 
        WHERE m.conversation_id = c.id
    ),
    last_message_at = (
        SELECT MAX(created_at) 
        FROM messages m 
        WHERE m.conversation_id = c.id
    )
WHERE message_count = 0 OR message_count IS NULL;

-- ============================================
-- PART 5: Create Views for Active Data
-- ============================================

-- View for active (non-archived, non-deleted) conversations
CREATE OR REPLACE VIEW active_conversations AS
SELECT * FROM conversations
WHERE archived_at IS NULL 
  AND deleted_at IS NULL;

-- View for recent messages (last 6 months)
CREATE OR REPLACE VIEW recent_messages AS
SELECT * FROM messages
WHERE created_at > NOW() - INTERVAL '6 months'
  AND archived_at IS NULL;

-- ============================================
-- PART 6: Add Comments for Documentation
-- ============================================

COMMENT ON COLUMN conversations.archived_at IS 'Timestamp when conversation was archived (6+ months old)';
COMMENT ON COLUMN conversations.deleted_at IS 'Soft delete timestamp (12+ months old)';
COMMENT ON COLUMN conversations.message_count IS 'Cached count of messages in conversation';
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp of most recent message';

COMMENT ON INDEX idx_conversations_user_created IS 'Optimizes conversation list queries';
COMMENT ON INDEX idx_messages_conv_id_created IS 'Optimizes message pagination queries';

-- ============================================
-- PART 7: Analyze Tables for Query Planner
-- ============================================

ANALYZE conversations;
ANALYZE messages;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check index creation
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, indexname;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('conversations', 'messages');

-- Migration complete
SELECT 'Chat storage optimization migration completed successfully!' AS status;
