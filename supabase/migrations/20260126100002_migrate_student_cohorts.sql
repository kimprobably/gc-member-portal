-- Migrate existing students to student_cohorts junction table
-- Add their bootcamp cohort membership
INSERT INTO student_cohorts (student_id, cohort_id, role, joined_at)
SELECT
  s.id as student_id,
  c.id as cohort_id,
  'student' as role,
  s.created_at as joined_at
FROM bootcamp_students s
JOIN lms_cohorts c ON LOWER(c.name) = LOWER(s.cohort)
WHERE s.cohort IS NOT NULL
ON CONFLICT (student_id, cohort_id) DO NOTHING;

-- Add all students to Resources cohort
INSERT INTO student_cohorts (student_id, cohort_id, role, joined_at)
SELECT
  s.id as student_id,
  '00000000-0000-0000-0000-000000000001' as cohort_id,
  'resources' as role,
  s.created_at as joined_at
FROM bootcamp_students s
ON CONFLICT (student_id, cohort_id) DO NOTHING;
