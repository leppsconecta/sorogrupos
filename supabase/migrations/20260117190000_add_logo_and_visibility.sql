-- Add logo_url to companies
ALTER TABLE "public"."companies" ADD COLUMN IF NOT EXISTS "logo_url" text;

-- Add public_hidden to jobs
ALTER TABLE "public"."jobs" ADD COLUMN IF NOT EXISTS "public_hidden" boolean DEFAULT false;

-- Create 'company-logos' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read of logos
CREATE POLICY "Public Read Logos"
ON storage.objects
FOR SELECT
USING ( bucket_id = 'company-logos' );

-- Policy: Allow authenticated insert/update of logos (simple policy, ideally owner only)
CREATE POLICY "Auth Upload Logos"
ON storage.objects
FOR INSERT
WITH CHECK ( bucket_id = 'company-logos' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Update Logos"
ON storage.objects
FOR UPDATE
USING ( bucket_id = 'company-logos' AND auth.role() = 'authenticated' );
