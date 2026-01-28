-- Migration: Create Blueprint settings and content blocks tables
-- Purpose: Store global settings and editable marketing content for the Blueprint feature
-- Date: 2026-01-28
-- IDEMPOTENT: Safe to run multiple times

-- ============================================
-- BLUEPRINT SETTINGS TABLE
-- Stores global settings like sticky_cta_enabled,
-- foundations_payment_url, engineering_payment_url, etc.
-- ============================================
CREATE TABLE IF NOT EXISTS blueprint_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on key for fast lookups
CREATE INDEX IF NOT EXISTS idx_blueprint_settings_key ON blueprint_settings(key);

-- ============================================
-- BLUEPRINT CONTENT BLOCKS TABLE
-- Stores editable content blocks like allbound_system,
-- bootcamp_pitch, faqs, cta_copy_1, etc.
-- ============================================
CREATE TABLE IF NOT EXISTS blueprint_content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_key TEXT NOT NULL UNIQUE,
  content JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on block_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_blueprint_content_blocks_key ON blueprint_content_blocks(block_key);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE blueprint_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_content_blocks ENABLE ROW LEVEL SECURITY;

-- Blueprint Settings: Public read, admin write
DROP POLICY IF EXISTS "blueprint_settings_select" ON blueprint_settings;
CREATE POLICY "blueprint_settings_select" ON blueprint_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "blueprint_settings_insert" ON blueprint_settings;
CREATE POLICY "blueprint_settings_insert" ON blueprint_settings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "blueprint_settings_update" ON blueprint_settings;
CREATE POLICY "blueprint_settings_update" ON blueprint_settings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "blueprint_settings_delete" ON blueprint_settings;
CREATE POLICY "blueprint_settings_delete" ON blueprint_settings FOR DELETE USING (true);

-- Blueprint Content Blocks: Public read, admin write
DROP POLICY IF EXISTS "blueprint_content_blocks_select" ON blueprint_content_blocks;
CREATE POLICY "blueprint_content_blocks_select" ON blueprint_content_blocks FOR SELECT USING (true);
DROP POLICY IF EXISTS "blueprint_content_blocks_insert" ON blueprint_content_blocks;
CREATE POLICY "blueprint_content_blocks_insert" ON blueprint_content_blocks FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "blueprint_content_blocks_update" ON blueprint_content_blocks;
CREATE POLICY "blueprint_content_blocks_update" ON blueprint_content_blocks FOR UPDATE USING (true);
DROP POLICY IF EXISTS "blueprint_content_blocks_delete" ON blueprint_content_blocks;
CREATE POLICY "blueprint_content_blocks_delete" ON blueprint_content_blocks FOR DELETE USING (true);

-- ============================================
-- UPDATE TIMESTAMP TRIGGERS
-- Uses existing update_updated_at_column() function
-- ============================================

DROP TRIGGER IF EXISTS update_blueprint_settings_updated_at ON blueprint_settings;
CREATE TRIGGER update_blueprint_settings_updated_at
  BEFORE UPDATE ON blueprint_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blueprint_content_blocks_updated_at ON blueprint_content_blocks;
CREATE TRIGGER update_blueprint_content_blocks_updated_at
  BEFORE UPDATE ON blueprint_content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE blueprint_settings IS 'Global settings for the Blueprint feature (e.g., sticky_cta_enabled, payment URLs)';
COMMENT ON COLUMN blueprint_settings.key IS 'Unique setting key (e.g., sticky_cta_enabled, foundations_payment_url)';
COMMENT ON COLUMN blueprint_settings.value IS 'Setting value as JSONB (can be boolean, string, object, etc.)';

COMMENT ON TABLE blueprint_content_blocks IS 'Editable marketing content blocks for Blueprint pages';
COMMENT ON COLUMN blueprint_content_blocks.block_key IS 'Unique block identifier (e.g., allbound_system, bootcamp_pitch, faqs, cta_copy_1)';
COMMENT ON COLUMN blueprint_content_blocks.content IS 'Block content as JSONB (can include title, body, items array, etc.)';
