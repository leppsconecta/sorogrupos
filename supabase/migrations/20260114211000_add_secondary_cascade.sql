-- Migration to add ON DELETE CASCADE to secondary relationships

-- 1. Jobs -> Folder Companies
-- Ensures that if a folder company is deleted (e.g. when user is deleted), the jobs linked to it are also deleted.
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_folder_company_id_fkey;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_folder_company_id_fkey 
    FOREIGN KEY (folder_company_id) REFERENCES public.folder_companies(id) ON DELETE CASCADE;

-- 2. Job Contacts -> Jobs
-- Ensures that if a job is deleted, its contacts are also deleted.
ALTER TABLE public.job_contacts DROP CONSTRAINT IF EXISTS job_contacts_job_id_fkey;
ALTER TABLE public.job_contacts ADD CONSTRAINT job_contacts_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
