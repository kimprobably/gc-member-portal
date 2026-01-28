-- Migration: Add missing columns to blueprint_content_blocks and blueprint_settings
-- The original migration used a simple JSONB schema, but the service layer expects typed columns
-- IDEMPOTENT: Safe to run multiple times

-- ============================================
-- BLUEPRINT CONTENT BLOCKS: Add typed columns
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_content_blocks' AND column_name = 'block_type'
    ) THEN
        ALTER TABLE blueprint_content_blocks ADD COLUMN block_type TEXT;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_content_blocks' AND column_name = 'title'
    ) THEN
        ALTER TABLE blueprint_content_blocks ADD COLUMN title TEXT;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_content_blocks' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE blueprint_content_blocks ADD COLUMN image_url TEXT;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_content_blocks' AND column_name = 'cta_text'
    ) THEN
        ALTER TABLE blueprint_content_blocks ADD COLUMN cta_text TEXT;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_content_blocks' AND column_name = 'cta_url'
    ) THEN
        ALTER TABLE blueprint_content_blocks ADD COLUMN cta_url TEXT;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_content_blocks' AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE blueprint_content_blocks ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_content_blocks' AND column_name = 'is_visible'
    ) THEN
        ALTER TABLE blueprint_content_blocks ADD COLUMN is_visible BOOLEAN DEFAULT true;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_content_blocks' AND column_name = 'target_offer'
    ) THEN
        ALTER TABLE blueprint_content_blocks ADD COLUMN target_offer TEXT;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_content_blocks' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE blueprint_content_blocks ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END$$;

-- Change 'content' column from JSONB to TEXT if it's JSONB
-- (We need text for markdown content rendering)
-- Note: This is safe because the table is empty
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_content_blocks' AND column_name = 'content' AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE blueprint_content_blocks ALTER COLUMN content TYPE TEXT USING content::TEXT;
    END IF;
END$$;

-- ============================================
-- BLUEPRINT SETTINGS: Add typed columns
-- The original table used key/value JSONB pairs,
-- but the service expects a single row with typed columns
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'sticky_cta_enabled'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN sticky_cta_enabled BOOLEAN DEFAULT true;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'foundations_payment_url'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN foundations_payment_url TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'engineering_payment_url'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN engineering_payment_url TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'cal_booking_link'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN cal_booking_link TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'show_bootcamp_offer'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN show_bootcamp_offer BOOLEAN DEFAULT true;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'show_gc_offer'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN show_gc_offer BOOLEAN DEFAULT true;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'show_dfy_offer'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN show_dfy_offer BOOLEAN DEFAULT true;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'bootcamp_offer_title'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN bootcamp_offer_title TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'bootcamp_offer_description'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN bootcamp_offer_description TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'bootcamp_offer_cta'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN bootcamp_offer_cta TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'bootcamp_offer_url'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN bootcamp_offer_url TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'gc_offer_title'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN gc_offer_title TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'gc_offer_description'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN gc_offer_description TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'gc_offer_cta'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN gc_offer_cta TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'gc_offer_url'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN gc_offer_url TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'dfy_offer_title'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN dfy_offer_title TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'dfy_offer_description'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN dfy_offer_description TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'dfy_offer_cta'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN dfy_offer_cta TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'dfy_offer_url'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN dfy_offer_url TEXT DEFAULT '';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'default_offer_unlocked'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN default_offer_unlocked BOOLEAN DEFAULT false;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blueprint_settings' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE blueprint_settings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END$$;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_blueprint_content_blocks_type ON blueprint_content_blocks(block_type);
CREATE INDEX IF NOT EXISTS idx_blueprint_content_blocks_visible ON blueprint_content_blocks(is_visible) WHERE is_visible = true;
