-- Create system cohorts for Resources and Members
INSERT INTO lms_cohorts (id, name, description, status, start_date, end_date)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Resources', 'Shared resources available to all students', 'Active', NULL, NULL),
  ('00000000-0000-0000-0000-000000000002', 'Members', 'Exclusive content for subscribed members', 'Active', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
