-- Ensure job_applications table exists (re-stating for safety or completeness)
CREATE TABLE IF NOT EXISTS public.job_applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    city text,
    resume_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Allow public insert for job applications
DROP POLICY IF EXISTS "Allow public insert application" ON public.job_applications;
CREATE POLICY "Allow public insert application"
ON public.job_applications
FOR INSERT
WITH CHECK (true);

-- Create job_reports table
CREATE TABLE IF NOT EXISTS public.job_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'pending', -- pending, resolved, dismissed
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.job_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert report" ON public.job_reports;
CREATE POLICY "Allow public insert report"
ON public.job_reports
FOR INSERT
WITH CHECK (true);

-- Create job_questions table
CREATE TABLE IF NOT EXISTS public.job_questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    question text NOT NULL,
    status text DEFAULT 'pending', -- pending, answered
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.job_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert question" ON public.job_questions;
CREATE POLICY "Allow public insert question"
ON public.job_questions
FOR INSERT
WITH CHECK (true);
