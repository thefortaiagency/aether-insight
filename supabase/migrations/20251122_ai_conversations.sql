-- AI Conversations: Persistent chat memory for Mat Ops AI
-- Created: 2025-11-22

-- ==========================================
-- CONVERSATIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,

    -- Conversation metadata
    title TEXT, -- Auto-generated or user-set title
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Status
    is_active BOOLEAN DEFAULT TRUE, -- Current active conversation
    archived BOOLEAN DEFAULT FALSE,

    -- Metadata
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- MESSAGES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,

    -- Message content
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,

    -- Action tracking (for agentic AI)
    action_name TEXT, -- Tool/action that was called
    action_params JSONB, -- Parameters passed to the action
    action_result JSONB, -- Result of the action
    action_success BOOLEAN,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_team ON ai_conversations(team_id);
CREATE INDEX IF NOT EXISTS idx_conversations_active ON ai_conversations(team_id, is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON ai_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON ai_messages(conversation_id, created_at);

-- ==========================================
-- HELPER FUNCTION: Get or create active conversation
-- ==========================================

CREATE OR REPLACE FUNCTION get_or_create_conversation(p_team_id UUID)
RETURNS UUID AS $$
DECLARE
    conv_id UUID;
BEGIN
    -- Find active conversation for this team
    SELECT id INTO conv_id
    FROM ai_conversations
    WHERE team_id = p_team_id AND is_active = TRUE
    ORDER BY last_message_at DESC
    LIMIT 1;

    -- If no active conversation, create one
    IF conv_id IS NULL THEN
        INSERT INTO ai_conversations (team_id, is_active)
        VALUES (p_team_id, TRUE)
        RETURNING id INTO conv_id;
    END IF;

    RETURN conv_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE ai_conversations IS 'Persistent chat conversations for Mat Ops AI';
COMMENT ON TABLE ai_messages IS 'Individual messages within AI conversations';
COMMENT ON COLUMN ai_messages.action_name IS 'Name of the tool/action called (add_wrestler, etc.)';
COMMENT ON COLUMN ai_messages.action_result IS 'JSON result from the action execution';
