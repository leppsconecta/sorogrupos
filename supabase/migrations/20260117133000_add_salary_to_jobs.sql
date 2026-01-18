-- Add salary column to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS salary TEXT;
