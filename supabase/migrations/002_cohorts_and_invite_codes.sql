-- Cohorts and Invite Codes for Self-Registration
-- Run this migration in Supabase SQL Editor

-- ============================================
-- BOOTCAMP COHORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bootcamp_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for cohorts
CREATE INDEX IF NOT EXISTS idx_bootcamp_cohorts_name ON bootcamp_cohorts(name);
CREATE INDEX IF NOT EXISTS idx_bootcamp_cohorts_status ON bootcamp_cohorts(status);

-- ============================================
-- BOOTCAMP INVITE CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bootcamp_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  cohort_id UUID REFERENCES bootcamp_cohorts(id) ON DELETE CASCADE,
  max_uses INTEGER DEFAULT NULL,  -- NULL = unlimited
  use_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Disabled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for invite codes
CREATE INDEX IF NOT EXISTS idx_bootcamp_invite_codes_code ON bootcamp_invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_bootcamp_invite_codes_cohort ON bootcamp_invite_codes(cohort_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_invite_codes_status ON bootcamp_invite_codes(status);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE bootcamp_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_invite_codes ENABLE ROW LEVEL SECURITY;

-- Cohorts policies
CREATE POLICY "Allow public read for cohorts" ON bootcamp_cohorts
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert for cohorts" ON bootcamp_cohorts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update for cohorts" ON bootcamp_cohorts
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete for cohorts" ON bootcamp_cohorts
  FOR DELETE USING (true);

-- Invite codes policies
CREATE POLICY "Allow public read for invite codes" ON bootcamp_invite_codes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert for invite codes" ON bootcamp_invite_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update for invite codes" ON bootcamp_invite_codes
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete for invite codes" ON bootcamp_invite_codes
  FOR DELETE USING (true);

-- ============================================
-- INSERT DEFAULT COHORT
-- ============================================
INSERT INTO bootcamp_cohorts (name, description, status) VALUES
  ('Global', 'Default cohort for all students', 'Active')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- INSERT JANUARY 2027 COHORT WITH INVITE CODE
-- ============================================
INSERT INTO bootcamp_cohorts (name, description, status) VALUES
  ('January 2027 Cohort', 'January 2027 bootcamp cohort', 'Active')
ON CONFLICT (name) DO NOTHING;

-- Create invite code JAN27 for January 2027 Cohort
INSERT INTO bootcamp_invite_codes (code, cohort_id, status)
SELECT 'JAN27', id, 'Active'
FROM bootcamp_cohorts
WHERE name = 'January 2027 Cohort'
ON CONFLICT (code) DO NOTHING;
