-- Create public storage bucket for client logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to logo files
CREATE POLICY "Public read access for client logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-logos');

-- Allow authenticated users to upload logo files
CREATE POLICY "Authenticated upload for client logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'client-logos');

-- Allow authenticated users to delete logo files
CREATE POLICY "Authenticated delete for client logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'client-logos');
