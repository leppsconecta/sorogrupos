-- Add username and profile_header_color to companies table
ALTER TABLE "public"."companies" ADD COLUMN IF NOT EXISTS "username" text UNIQUE;
ALTER TABLE "public"."companies" ADD COLUMN IF NOT EXISTS "profile_header_color" text DEFAULT '#1e293b';

-- Create job_applications table
CREATE TABLE IF NOT EXISTS "public"."job_applications" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "job_id" uuid NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "company_id" uuid NOT NULL REFERENCES "public"."companies"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "phone" text NOT NULL,
    "city" text NOT NULL,
    "resume_url" text,
    "created_at" timestamp with time zone DEFAULT now()
);

-- Enable RLS on job_applications
ALTER TABLE "public"."job_applications" ENABLE ROW LEVEL SECURITY;

-- Allow public insertion (for unauthenticated applicants)
CREATE POLICY "Allow public insert to job_applications"
ON "public"."job_applications"
FOR INSERT
WITH CHECK (true);

-- Allow company owners to view applications for their jobs
CREATE POLICY "Allow owners to view their job applications"
ON "public"."job_applications"
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM "public"."companies"
        WHERE id = job_applications.company_id
        AND owner_id = auth.uid()
    )
);

-- Allow public read access to companies username and branding
-- (Assuming companies table already has policies, valid to add specific one or check existing)
-- Check if existing policy covers this. If not, add one.
CREATE POLICY "Allow public read of company profile info"
ON "public"."companies"
FOR SELECT
USING (true); -- Or restrict columns if Supabase supported column-level RLS easily, but row-level is standard.
-- Note: 'companies' usually contains public info anyway. Ensuring it's accessible.
