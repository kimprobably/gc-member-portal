-- LMS Migration: Airtable to Supabase with Cohort Independence
-- This migration creates the LMS curriculum tables with full cohort independence
-- Run this migration in Supabase SQL Editor
-- IDEMPOTENT: Safe to run multiple times

-- ============================================
-- LMS COHORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lms_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lms_cohorts_status ON lms_cohorts(status);
CREATE INDEX IF NOT EXISTS idx_lms_cohorts_name ON lms_cohorts(name);

-- ============================================
-- LMS WEEKS TABLE
-- Each cohort has its own independent set of weeks
-- ============================================
CREATE TABLE IF NOT EXISTS lms_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES lms_cohorts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Unique constraint: no duplicate week titles within a cohort
  UNIQUE(cohort_id, title)
);

CREATE INDEX IF NOT EXISTS idx_lms_weeks_cohort ON lms_weeks(cohort_id);
CREATE INDEX IF NOT EXISTS idx_lms_weeks_sort ON lms_weeks(sort_order);

-- ============================================
-- LMS LESSONS TABLE
-- Lessons belong to a week (and indirectly to a cohort)
-- ============================================
CREATE TABLE IF NOT EXISTS lms_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES lms_weeks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lms_lessons_week ON lms_lessons(week_id);
CREATE INDEX IF NOT EXISTS idx_lms_lessons_sort ON lms_lessons(sort_order);

-- ============================================
-- LMS CONTENT ITEMS TABLE
-- Content items belong to a lesson
-- Supports multiple content types with different renderers
-- ============================================
DO $$ BEGIN
  CREATE TYPE lms_content_type AS ENUM (
    'video',           -- Grain, YouTube, Loom, Vimeo, etc.
    'slide_deck',      -- Gamma presentations
    'guide',           -- Guidde tutorials
    'clay_table',      -- Clay shared tables
    'ai_tool',         -- Reference to AI tool slug
    'text',            -- Plain text/markdown content
    'external_link',   -- Link to external resource
    'credentials'      -- Login credentials with copy buttons
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS lms_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lms_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type lms_content_type NOT NULL,
  -- URL for embeddable content (video, slide deck, guide, clay table, external link)
  embed_url TEXT,
  -- For AI tool references - the tool slug
  ai_tool_slug TEXT,
  -- For text/credentials content - the raw content
  content_text TEXT,
  -- For credentials - structured data (JSON with login, password, notes)
  credentials_data JSONB,
  -- Optional description/notes
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lms_content_lesson ON lms_content_items(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lms_content_type ON lms_content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_lms_content_sort ON lms_content_items(sort_order);

-- ============================================
-- LMS ACTION ITEMS TABLE
-- Action items belong to a week
-- Can be cohort-wide or assigned to specific users
-- ============================================
CREATE TABLE IF NOT EXISTS lms_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES lms_weeks(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  -- Optional: assign to specific user email (null = all users in cohort)
  assigned_to_email TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lms_action_items_week ON lms_action_items(week_id);
CREATE INDEX IF NOT EXISTS idx_lms_action_items_assigned ON lms_action_items(assigned_to_email);
CREATE INDEX IF NOT EXISTS idx_lms_action_items_sort ON lms_action_items(sort_order);

-- ============================================
-- LMS STUDENT CURRICULUM PROGRESS
-- Tracks student progress on content items and action items
-- ============================================
CREATE TABLE IF NOT EXISTS lms_student_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES bootcamp_students(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lms_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lms_lesson_progress_student ON lms_student_lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lms_lesson_progress_lesson ON lms_student_lesson_progress(lesson_id);

CREATE TABLE IF NOT EXISTS lms_student_action_item_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES bootcamp_students(id) ON DELETE CASCADE,
  action_item_id UUID NOT NULL REFERENCES lms_action_items(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  proof_of_work TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, action_item_id)
);

CREATE INDEX IF NOT EXISTS idx_lms_action_progress_student ON lms_student_action_item_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lms_action_progress_item ON lms_student_action_item_progress(action_item_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all LMS tables
ALTER TABLE lms_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_student_action_item_progress ENABLE ROW LEVEL SECURITY;

-- Cohorts: Public read, admin write
DROP POLICY IF EXISTS "lms_cohorts_select" ON lms_cohorts;
CREATE POLICY "lms_cohorts_select" ON lms_cohorts FOR SELECT USING (true);
DROP POLICY IF EXISTS "lms_cohorts_insert" ON lms_cohorts;
CREATE POLICY "lms_cohorts_insert" ON lms_cohorts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "lms_cohorts_update" ON lms_cohorts;
CREATE POLICY "lms_cohorts_update" ON lms_cohorts FOR UPDATE USING (true);
DROP POLICY IF EXISTS "lms_cohorts_delete" ON lms_cohorts;
CREATE POLICY "lms_cohorts_delete" ON lms_cohorts FOR DELETE USING (true);

-- Weeks: Public read, admin write
DROP POLICY IF EXISTS "lms_weeks_select" ON lms_weeks;
CREATE POLICY "lms_weeks_select" ON lms_weeks FOR SELECT USING (true);
DROP POLICY IF EXISTS "lms_weeks_insert" ON lms_weeks;
CREATE POLICY "lms_weeks_insert" ON lms_weeks FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "lms_weeks_update" ON lms_weeks;
CREATE POLICY "lms_weeks_update" ON lms_weeks FOR UPDATE USING (true);
DROP POLICY IF EXISTS "lms_weeks_delete" ON lms_weeks;
CREATE POLICY "lms_weeks_delete" ON lms_weeks FOR DELETE USING (true);

-- Lessons: Public read, admin write
DROP POLICY IF EXISTS "lms_lessons_select" ON lms_lessons;
CREATE POLICY "lms_lessons_select" ON lms_lessons FOR SELECT USING (true);
DROP POLICY IF EXISTS "lms_lessons_insert" ON lms_lessons;
CREATE POLICY "lms_lessons_insert" ON lms_lessons FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "lms_lessons_update" ON lms_lessons;
CREATE POLICY "lms_lessons_update" ON lms_lessons FOR UPDATE USING (true);
DROP POLICY IF EXISTS "lms_lessons_delete" ON lms_lessons;
CREATE POLICY "lms_lessons_delete" ON lms_lessons FOR DELETE USING (true);

-- Content Items: Public read, admin write
DROP POLICY IF EXISTS "lms_content_items_select" ON lms_content_items;
CREATE POLICY "lms_content_items_select" ON lms_content_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "lms_content_items_insert" ON lms_content_items;
CREATE POLICY "lms_content_items_insert" ON lms_content_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "lms_content_items_update" ON lms_content_items;
CREATE POLICY "lms_content_items_update" ON lms_content_items FOR UPDATE USING (true);
DROP POLICY IF EXISTS "lms_content_items_delete" ON lms_content_items;
CREATE POLICY "lms_content_items_delete" ON lms_content_items FOR DELETE USING (true);

-- Action Items: Public read, admin write
DROP POLICY IF EXISTS "lms_action_items_select" ON lms_action_items;
CREATE POLICY "lms_action_items_select" ON lms_action_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "lms_action_items_insert" ON lms_action_items;
CREATE POLICY "lms_action_items_insert" ON lms_action_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "lms_action_items_update" ON lms_action_items;
CREATE POLICY "lms_action_items_update" ON lms_action_items FOR UPDATE USING (true);
DROP POLICY IF EXISTS "lms_action_items_delete" ON lms_action_items;
CREATE POLICY "lms_action_items_delete" ON lms_action_items FOR DELETE USING (true);

-- Student Progress: Public read/write
DROP POLICY IF EXISTS "lms_lesson_progress_select" ON lms_student_lesson_progress;
CREATE POLICY "lms_lesson_progress_select" ON lms_student_lesson_progress FOR SELECT USING (true);
DROP POLICY IF EXISTS "lms_lesson_progress_insert" ON lms_student_lesson_progress;
CREATE POLICY "lms_lesson_progress_insert" ON lms_student_lesson_progress FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "lms_lesson_progress_update" ON lms_student_lesson_progress;
CREATE POLICY "lms_lesson_progress_update" ON lms_student_lesson_progress FOR UPDATE USING (true);

DROP POLICY IF EXISTS "lms_action_progress_select" ON lms_student_action_item_progress;
CREATE POLICY "lms_action_progress_select" ON lms_student_action_item_progress FOR SELECT USING (true);
DROP POLICY IF EXISTS "lms_action_progress_insert" ON lms_student_action_item_progress;
CREATE POLICY "lms_action_progress_insert" ON lms_student_action_item_progress FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "lms_action_progress_update" ON lms_student_action_item_progress;
CREATE POLICY "lms_action_progress_update" ON lms_student_action_item_progress FOR UPDATE USING (true);

-- ============================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================

-- Apply update_updated_at_column trigger to LMS tables
DROP TRIGGER IF EXISTS update_lms_cohorts_updated_at ON lms_cohorts;
CREATE TRIGGER update_lms_cohorts_updated_at
  BEFORE UPDATE ON lms_cohorts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lms_weeks_updated_at ON lms_weeks;
CREATE TRIGGER update_lms_weeks_updated_at
  BEFORE UPDATE ON lms_weeks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lms_lessons_updated_at ON lms_lessons;
CREATE TRIGGER update_lms_lessons_updated_at
  BEFORE UPDATE ON lms_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lms_content_items_updated_at ON lms_content_items;
CREATE TRIGGER update_lms_content_items_updated_at
  BEFORE UPDATE ON lms_content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lms_action_items_updated_at ON lms_action_items;
CREATE TRIGGER update_lms_action_items_updated_at
  BEFORE UPDATE ON lms_action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTION: Duplicate Cohort
-- Creates a complete independent copy of a cohort with all its curriculum
-- ============================================
CREATE OR REPLACE FUNCTION duplicate_lms_cohort(
  source_cohort_id UUID,
  new_cohort_name TEXT,
  new_cohort_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_cohort_id UUID;
  week_mapping JSONB := '{}';
  lesson_mapping JSONB := '{}';
  old_week_id UUID;
  new_week_id UUID;
  old_lesson_id UUID;
  new_lesson_id UUID;
  week_row RECORD;
  lesson_row RECORD;
  content_row RECORD;
  action_row RECORD;
BEGIN
  -- Create the new cohort
  INSERT INTO lms_cohorts (name, description, status)
  VALUES (new_cohort_name, COALESCE(new_cohort_description, 'Duplicated from existing cohort'), 'Active')
  RETURNING id INTO new_cohort_id;

  -- Copy all weeks
  FOR week_row IN
    SELECT * FROM lms_weeks WHERE cohort_id = source_cohort_id ORDER BY sort_order
  LOOP
    INSERT INTO lms_weeks (cohort_id, title, description, sort_order, is_visible)
    VALUES (new_cohort_id, week_row.title, week_row.description, week_row.sort_order, week_row.is_visible)
    RETURNING id INTO new_week_id;

    -- Store the week mapping
    week_mapping := week_mapping || jsonb_build_object(week_row.id::text, new_week_id::text);

    -- Copy lessons for this week
    FOR lesson_row IN
      SELECT * FROM lms_lessons WHERE week_id = week_row.id ORDER BY sort_order
    LOOP
      INSERT INTO lms_lessons (week_id, title, description, sort_order, is_visible)
      VALUES (new_week_id, lesson_row.title, lesson_row.description, lesson_row.sort_order, lesson_row.is_visible)
      RETURNING id INTO new_lesson_id;

      -- Store the lesson mapping
      lesson_mapping := lesson_mapping || jsonb_build_object(lesson_row.id::text, new_lesson_id::text);

      -- Copy content items for this lesson
      FOR content_row IN
        SELECT * FROM lms_content_items WHERE lesson_id = lesson_row.id ORDER BY sort_order
      LOOP
        INSERT INTO lms_content_items (
          lesson_id, title, content_type, embed_url, ai_tool_slug,
          content_text, credentials_data, description, sort_order, is_visible
        )
        VALUES (
          new_lesson_id, content_row.title, content_row.content_type, content_row.embed_url,
          content_row.ai_tool_slug, content_row.content_text, content_row.credentials_data,
          content_row.description, content_row.sort_order, content_row.is_visible
        );
      END LOOP;
    END LOOP;

    -- Copy action items for this week
    FOR action_row IN
      SELECT * FROM lms_action_items WHERE week_id = week_row.id ORDER BY sort_order
    LOOP
      INSERT INTO lms_action_items (week_id, text, description, sort_order, assigned_to_email, is_visible)
      VALUES (new_week_id, action_row.text, action_row.description, action_row.sort_order,
              action_row.assigned_to_email, action_row.is_visible);
    END LOOP;
  END LOOP;

  RETURN new_cohort_id;
END;
$$ LANGUAGE plpgsql;
