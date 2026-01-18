-- Add description and profile_title_color to companies table
ALTER TABLE "public"."companies" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "public"."companies" ADD COLUMN IF NOT EXISTS "profile_title_color" text DEFAULT '#1e293b';

-- Attempt to create 'resumes' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false) -- Private bucket, use signed URLs or RLS
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public to upload files (resumes)
CREATE POLICY "Public Upload Resumes"
ON storage.objects
FOR INSERT
WITH CHECK ( bucket_id = 'resumes' );

-- Policy: Allow authenticated users (owners) to read files
-- Ideally restricted to the specific Resume owner, but for now allow auth users to read (simplification)
CREATE POLICY "Auth Read Resumes"
ON storage.objects
FOR SELECT
USING ( bucket_id = 'resumes' AND auth.role() = 'authenticated' );
