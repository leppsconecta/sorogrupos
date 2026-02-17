-- Migration to adapt job_applications table for internal linking
-- Problem: Original schema enforced NOT NULL on name/phone/etc, but internal linking uses candidate_id.

-- 1. Make legacy columns nullable
ALTER TABLE public.job_applications ALTER COLUMN name DROP NOT NULL;
ALTER TABLE public.job_applications ALTER COLUMN phone DROP NOT NULL;
-- email was already optional in 20260117? Check.
-- Line 8: email text, (nullable) in 20260117.
-- But let's ensure it just in case.
ALTER TABLE public.job_applications ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.job_applications ALTER COLUMN city DROP NOT NULL;
ALTER TABLE public.job_applications ALTER COLUMN resume_url DROP NOT NULL;

-- 2. Add candidate_id reference (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'candidate_id') THEN
        ALTER TABLE public.job_applications ADD COLUMN candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Add Status and Origin columns if not exist (re-applying from root migration attempt)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'status') THEN
        ALTER TABLE public.job_applications ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'origin') THEN
        ALTER TABLE public.job_applications ADD COLUMN origin TEXT DEFAULT 'candidate' CHECK (origin IN ('candidate', 'operator'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'applied_at') THEN
        ALTER TABLE public.job_applications ADD COLUMN applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- 4. Add unique index to prevent duplicate applications for same job/candidate
-- Only if candidate_id is set
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_applications_unique_candidate_job 
ON public.job_applications(job_id, candidate_id) 
WHERE candidate_id IS NOT NULL;

-- 5. Update RLS Policies
-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (Admins/Operators) to manage applications
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.job_applications;
CREATE POLICY "Enable full access for authenticated users" 
ON public.job_applications 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Ensure public can still insert (for website applications)
-- Policy "Allow public insert application" from 20260117 might still be needed?
-- "Allow public insert application" ON public.job_applications FOR INSERT WITH CHECK (true);
-- Let's NOT drop public access unless we intend to block it.
-- But public users are 'anon'. Authenticated users are 'authenticated'.
-- My new policy handles authenticated. Existing policy handles anon.
-- So we are good.
