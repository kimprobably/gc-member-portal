-- ============================================
-- Bootcamp Cold Email Recipes
-- ============================================

-- Recipes table
CREATE TABLE IF NOT EXISTS bootcamp_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES bootcamp_students(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  email_template jsonb, -- {subject, body} or null
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, slug)
);

-- Contact lists table
CREATE TABLE IF NOT EXISTS bootcamp_contact_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES bootcamp_students(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_count integer NOT NULL DEFAULT 0,
  column_mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS bootcamp_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES bootcamp_contact_lists(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES bootcamp_students(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  step_outputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  enrichment_status text NOT NULL DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'processing', 'done', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bootcamp_recipes_student ON bootcamp_recipes(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_contact_lists_student ON bootcamp_contact_lists(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_contacts_list ON bootcamp_contacts(list_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_contacts_student ON bootcamp_contacts(student_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_contacts_status ON bootcamp_contacts(enrichment_status);

-- RLS (service-role pattern matching existing bootcamp tables)
ALTER TABLE bootcamp_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_contacts ENABLE ROW LEVEL SECURITY;

-- Allow all access via service role (anon key access controlled at app layer)
CREATE POLICY "bootcamp_recipes_all" ON bootcamp_recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bootcamp_contact_lists_all" ON bootcamp_contact_lists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bootcamp_contacts_all" ON bootcamp_contacts FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger for recipes
CREATE OR REPLACE FUNCTION update_bootcamp_recipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bootcamp_recipes_updated_at
  BEFORE UPDATE ON bootcamp_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_bootcamp_recipes_updated_at();
