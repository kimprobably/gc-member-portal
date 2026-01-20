-- LinkedIn Bootcamp Student Onboarding System
-- Run this migration in Supabase SQL Editor

-- ============================================
-- BOOTCAMP STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bootcamp_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  company TEXT,
  cohort TEXT DEFAULT 'Global',
  status TEXT DEFAULT 'Onboarding' CHECK (status IN ('Onboarding', 'Active', 'Completed', 'Paused', 'Churned')),
  access_level TEXT DEFAULT 'Full Access',
  purchase_date TIMESTAMP WITH TIME ZONE,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  slack_invited BOOLEAN DEFAULT FALSE,
  slack_invited_at TIMESTAMP WITH TIME ZONE,
  calendar_added BOOLEAN DEFAULT FALSE,
  calendar_added_at TIMESTAMP WITH TIME ZONE,
  payment_source TEXT,
  payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_bootcamp_students_email ON bootcamp_students(email);
CREATE INDEX IF NOT EXISTS idx_bootcamp_students_status ON bootcamp_students(status);
CREATE INDEX IF NOT EXISTS idx_bootcamp_students_cohort ON bootcamp_students(cohort);

-- ============================================
-- BOOTCAMP ONBOARDING CHECKLIST (Admin-configurable template)
-- ============================================
CREATE TABLE IF NOT EXISTS bootcamp_onboarding_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Welcome', 'Account Setup', 'AI Tools', 'Community', 'Getting Started')),
  description TEXT,
  video_url TEXT,
  doc_link TEXT,
  ai_tool_id TEXT,
  sort_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bootcamp_checklist_category ON bootcamp_onboarding_checklist(category);
CREATE INDEX IF NOT EXISTS idx_bootcamp_checklist_sort ON bootcamp_onboarding_checklist(sort_order);

-- ============================================
-- BOOTCAMP STUDENT PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS bootcamp_student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES bootcamp_students(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES bootcamp_onboarding_checklist(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Complete', 'Skipped')),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(student_id, checklist_item_id)
);

CREATE INDEX IF NOT EXISTS idx_bootcamp_progress_student ON bootcamp_student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_progress_item ON bootcamp_student_progress(checklist_item_id);

-- ============================================
-- BOOTCAMP STUDENT SURVEY (Intake form responses)
-- ============================================
CREATE TABLE IF NOT EXISTS bootcamp_student_survey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES bootcamp_students(id) ON DELETE CASCADE UNIQUE,
  -- Business Basics
  company_name TEXT,
  website TEXT,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('Solo', '2-10', '11-50', '51-200', '201-500', '500+')),
  role_title TEXT,
  -- Goals & Challenges
  primary_goal TEXT,
  biggest_challenges TEXT[],
  linkedin_experience TEXT CHECK (linkedin_experience IN ('None', 'Beginner', 'Intermediate', 'Advanced')),
  -- Lead Gen Details
  target_audience TEXT,
  current_lead_gen_methods TEXT[],
  monthly_outreach_volume TEXT CHECK (monthly_outreach_volume IN ('0', '1-100', '101-500', '501-1000', '1000+')),
  tools_currently_using TEXT[],
  -- Meta
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bootcamp_survey_student ON bootcamp_student_survey(student_id);

-- ============================================
-- BOOTCAMP SETTINGS (Configuration)
-- ============================================
CREATE TABLE IF NOT EXISTS bootcamp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT
);

-- Insert default settings
INSERT INTO bootcamp_settings (key, value, description) VALUES
  ('ai_tools_visible', 'true', 'Show AI tools section during onboarding'),
  ('intro_video_url', '""', 'Instructor intro video URL'),
  ('slack_channel_ids', '[]', 'Default Slack channels for invites'),
  ('calendar_event_ids', '[]', 'Google Calendar events to add students to'),
  ('welcome_message', '"Welcome to the LinkedIn Bootcamp! We''re excited to have you here."', 'Welcome message shown during onboarding')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- INSERT DEFAULT CHECKLIST ITEMS
-- ============================================
INSERT INTO bootcamp_onboarding_checklist (item, category, description, sort_order, is_required, is_visible) VALUES
  ('Watch the welcome video', 'Welcome', 'Get an introduction to the bootcamp and what to expect', 1, true, true),
  ('Complete your profile survey', 'Welcome', 'Help us understand your goals and experience', 2, true, true),
  ('Set up your account', 'Account Setup', 'Configure your account settings', 3, true, true),
  ('Explore the AI tools', 'AI Tools', 'Check out the AI-powered tools available to you', 4, false, true),
  ('Join the Slack community', 'Community', 'Connect with other bootcamp students', 5, true, true),
  ('Add bootcamp events to calendar', 'Community', 'Never miss a live session or workshop', 6, true, true),
  ('Start Module 1', 'Getting Started', 'Begin your learning journey', 7, true, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE bootcamp_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_onboarding_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_student_survey ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read for students table (email verification)
CREATE POLICY "Allow public read for student verification" ON bootcamp_students
  FOR SELECT USING (true);

-- Allow public insert for new students (from webhooks)
CREATE POLICY "Allow public insert for new students" ON bootcamp_students
  FOR INSERT WITH CHECK (true);

-- Allow public update for students
CREATE POLICY "Allow public update for students" ON bootcamp_students
  FOR UPDATE USING (true);

-- Checklist is readable by everyone
CREATE POLICY "Allow public read for checklist" ON bootcamp_onboarding_checklist
  FOR SELECT USING (true);

-- Allow public operations on checklist for admin
CREATE POLICY "Allow public insert for checklist" ON bootcamp_onboarding_checklist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update for checklist" ON bootcamp_onboarding_checklist
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete for checklist" ON bootcamp_onboarding_checklist
  FOR DELETE USING (true);

-- Progress is readable and writable
CREATE POLICY "Allow public read for progress" ON bootcamp_student_progress
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert for progress" ON bootcamp_student_progress
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update for progress" ON bootcamp_student_progress
  FOR UPDATE USING (true);

-- Survey is readable and writable
CREATE POLICY "Allow public read for survey" ON bootcamp_student_survey
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert for survey" ON bootcamp_student_survey
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update for survey" ON bootcamp_student_survey
  FOR UPDATE USING (true);

-- Settings are readable by everyone
CREATE POLICY "Allow public read for settings" ON bootcamp_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow public update for settings" ON bootcamp_settings
  FOR UPDATE USING (true);

-- ============================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_bootcamp_students_updated_at ON bootcamp_students;
CREATE TRIGGER update_bootcamp_students_updated_at
  BEFORE UPDATE ON bootcamp_students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bootcamp_survey_updated_at ON bootcamp_student_survey;
CREATE TRIGGER update_bootcamp_survey_updated_at
  BEFORE UPDATE ON bootcamp_student_survey
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
