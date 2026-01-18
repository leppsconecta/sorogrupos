
-- Add cover_url to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS cover_url text;

-- Create storage bucket for company covers if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-covers', 'company-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to covers
CREATE POLICY "Public Access Covers"
ON storage.objects FOR SELECT
USING ( bucket_id = 'company-covers' );

-- Policy to allow authenticated users to upload their own covers (simplification: allow auth users to upload)
CREATE POLICY "Auth Upload Covers"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'company-covers' AND auth.role() = 'authenticated' );

-- Policy to allow users to update their own covers
CREATE POLICY "Auth Update Covers"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'company-covers' AND auth.role() = 'authenticated' );
