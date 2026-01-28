-- Migration: Add Blueprint fields to prospects and bootcamp_students tables
-- Purpose: Support the Blueprint frontend feature with public URLs and offer recommendations
-- Date: 2026-01-28

-- ============================================
-- CREATE ENUM TYPE FOR RECOMMENDED OFFER
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blueprint_offer_type') THEN
        CREATE TYPE blueprint_offer_type AS ENUM ('foundations', 'engineering');
    END IF;
END$$;

-- ============================================
-- ADD COLUMNS TO PROSPECTS TABLE
-- ============================================

-- Add slug column (unique identifier for public URLs like /blueprint/gabrielle-san-nicola-7x3k)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects' AND column_name = 'slug'
    ) THEN
        ALTER TABLE prospects ADD COLUMN slug TEXT UNIQUE;
    END IF;
END$$;

-- Add offer_unlocked column (boolean to track if offer section is visible)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects' AND column_name = 'offer_unlocked'
    ) THEN
        ALTER TABLE prospects ADD COLUMN offer_unlocked BOOLEAN DEFAULT FALSE;
    END IF;
END$$;

-- Add recommended_offer column (enum: 'foundations' | 'engineering' | null)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects' AND column_name = 'recommended_offer'
    ) THEN
        ALTER TABLE prospects ADD COLUMN recommended_offer blueprint_offer_type;
    END IF;
END$$;

-- Add offer_note column (text for personalized offer notes/messages)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects' AND column_name = 'offer_note'
    ) THEN
        ALTER TABLE prospects ADD COLUMN offer_note TEXT;
    END IF;
END$$;

-- ============================================
-- ADD COLUMN TO BOOTCAMP_STUDENTS TABLE
-- ============================================

-- Add prospect_id column (FK to prospects.id for linking bootcamp students to their prospect record)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bootcamp_students' AND column_name = 'prospect_id'
    ) THEN
        ALTER TABLE bootcamp_students ADD COLUMN prospect_id UUID;
    END IF;
END$$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'bootcamp_students_prospect_id_fkey'
        AND table_name = 'bootcamp_students'
    ) THEN
        ALTER TABLE bootcamp_students
        ADD CONSTRAINT bootcamp_students_prospect_id_fkey
        FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE SET NULL;
    END IF;
END$$;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index on slug for fast lookups on public Blueprint pages
CREATE INDEX IF NOT EXISTS idx_prospects_slug ON prospects(slug);

-- Index on prospect_id for joins between bootcamp_students and prospects
CREATE INDEX IF NOT EXISTS idx_bootcamp_students_prospect_id ON bootcamp_students(prospect_id);

-- Index on offer_unlocked for filtering prospects with unlocked offers
CREATE INDEX IF NOT EXISTS idx_prospects_offer_unlocked ON prospects(offer_unlocked) WHERE offer_unlocked = TRUE;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON COLUMN prospects.slug IS 'Unique URL-friendly identifier for public Blueprint pages (e.g., gabrielle-san-nicola-7x3k)';
COMMENT ON COLUMN prospects.offer_unlocked IS 'Whether the offer/recommendation section is visible on the Blueprint page';
COMMENT ON COLUMN prospects.recommended_offer IS 'The recommended product: foundations or engineering';
COMMENT ON COLUMN prospects.offer_note IS 'Personalized note or message to display with the offer recommendation';
COMMENT ON COLUMN bootcamp_students.prospect_id IS 'Links bootcamp student to their original prospect record for Blueprint access';
