-- Migration: Improve Blueprint-Bootcamp linking infrastructure
-- Purpose: Add indexes, auto-linking trigger, backfill existing data, and create a convenience view
-- Date: 2026-01-30
-- IDEMPOTENT: Safe to run multiple times

-- ============================================
-- INDEXES FOR FAST LOOKUPS
-- ============================================

-- Index on prospects.email for fast email lookups (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects (lower(email));

-- Index on prospects.slug for fast public page lookups (only non-null slugs)
-- Note: Replaces the non-partial index from the earlier migration with a more efficient partial index
DROP INDEX IF EXISTS idx_prospects_slug;
CREATE INDEX IF NOT EXISTS idx_prospects_slug ON prospects (slug) WHERE slug IS NOT NULL;

-- ============================================
-- AUTO-LINK FUNCTION
-- When a bootcamp_student is inserted, automatically
-- link them to their prospect record by matching email.
-- ============================================
CREATE OR REPLACE FUNCTION link_student_to_prospect()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run if prospect_id is not already set
  IF NEW.prospect_id IS NULL AND NEW.email IS NOT NULL THEN
    UPDATE bootcamp_students
    SET prospect_id = p.id
    FROM prospects p
    WHERE bootcamp_students.id = NEW.id
      AND lower(p.email) = lower(NEW.email)
      AND p.status = 'complete';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUTO-LINK TRIGGER
-- Fires after a new bootcamp_student is inserted.
-- ============================================
DROP TRIGGER IF EXISTS auto_link_prospect ON bootcamp_students;
CREATE TRIGGER auto_link_prospect
  AFTER INSERT ON bootcamp_students
  FOR EACH ROW
  EXECUTE FUNCTION link_student_to_prospect();

-- ============================================
-- BACKFILL EXISTING STUDENTS
-- Link any existing bootcamp_students who have
-- a matching prospect record but no link yet.
-- ============================================
UPDATE bootcamp_students bs
SET prospect_id = p.id
FROM prospects p
WHERE bs.prospect_id IS NULL
  AND lower(bs.email) = lower(p.email)
  AND p.status = 'complete';

-- ============================================
-- CONVENIENCE VIEW: STUDENTS WITH BLUEPRINT DATA
-- Joins bootcamp_students to their prospect record
-- for easy querying of combined data.
-- ============================================
CREATE OR REPLACE VIEW student_blueprint_view AS
SELECT
  bs.id AS student_id,
  bs.email,
  bs.name AS student_name,
  bs.status AS student_status,
  bs.prospect_id,
  p.authority_score,
  p.score_profile_optimization,
  p.score_content_presence,
  p.score_outbound_systems,
  p.score_inbound_infrastructure,
  p.score_social_proof,
  p.buyer_persona,
  p.strategic_gap,
  p.strategic_opportunity,
  p.bottom_line,
  p.recommended_headline,
  p.voice_style_guide,
  p.slug AS blueprint_slug,
  p.status AS blueprint_status
FROM bootcamp_students bs
LEFT JOIN prospects p ON bs.prospect_id = p.id;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON FUNCTION link_student_to_prospect() IS 'Auto-links a new bootcamp student to their prospect record by matching email (case-insensitive)';
COMMENT ON VIEW student_blueprint_view IS 'Convenience view joining bootcamp students with their linked Blueprint prospect data';
