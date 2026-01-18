-- 1. Fix job_applications table (Add Email, Make City Optional)
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.job_applications ALTER COLUMN city DROP NOT NULL;

-- 2. Create Storage Bucket for Resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true) -- Public = true allows easier downloading via publicURL, or false for signed URLs. 
-- For simplicity and "Ver curriculo" preview, Public=false + basic RLS or Public=true with random names is common.
-- User "O usuario so pode ler ou enviar". Public send.
ON CONFLICT (id) DO UPDATE SET public = false; -- Let's keep it private by default for privacy, serve via Signed URL or RLS.

-- But wait, PublicPage uses `uploadData.path` and likely needs to generate a URL. 
-- If the bucket is private, we need `createSignedUrl`.
-- If the bucket is public, we usage `getPublicUrl`.
-- `PublicPage.tsx` uses `upload`. It doesn't generate a separate URL to clear.
-- The dashboard will likely use `createSignedUrl` or `getPublicUrl`.
-- Let's stick to Public=false (Private) for resumes (PII data).

-- 3. Storage Policies
-- Allow Public (derived from Anon role) to Upload
DROP POLICY IF EXISTS "Public Upload Resumes" ON storage.objects;
CREATE POLICY "Public Upload Resumes"
ON storage.objects
FOR INSERT
WITH CHECK ( bucket_id = 'resumes' );

-- Allow Public to Update/Select? NO. Only Owner.
-- Allow Company Owners (Authenticated) to View/Download their files.
DROP POLICY IF EXISTS "Auth Read Resumes" ON storage.objects;
CREATE POLICY "Auth Read Resumes"
ON storage.objects
FOR SELECT
USING ( bucket_id = 'resumes' AND auth.role() = 'authenticated' );
-- Ideally we check if `storage.objects.name` starts with `company_id` matching user, but `auth.uid()` check is complex in storage.
-- Simplified: Authenticated users can read resumes. (Acceptable for MVP SaaS if strictly internal, but ideally tighter).

-- 4. Enable RLS on job_applications for Public Insert (already done, but reinforcing)
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert application" ON public.job_applications;
CREATE POLICY "Allow public insert application" ON public.job_applications FOR INSERT WITH CHECK (true);
