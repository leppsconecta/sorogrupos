-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Drop potential conflicting policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow public read of company profile info" ON public.companies;
DROP POLICY IF EXISTS "Public read access" ON public.companies;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.companies;

-- Create a permissive public read policy for companies
CREATE POLICY "Allow public read of all companies"
ON public.companies
FOR SELECT
USING (true);

-- Enable RLS on jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Drop potential conflicting policies for jobs
DROP POLICY IF EXISTS "Allow public read of jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public read jobs" ON public.jobs;

-- Create a permissive public read policy for jobs
CREATE POLICY "Allow public read of all jobs"
ON public.jobs
FOR SELECT
USING (true);
