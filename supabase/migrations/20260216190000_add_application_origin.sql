-- Add origin column to job_applications to track the source of the application
-- Values: 'candidate' (default, via website), 'operator' (via dashboard)

ALTER TABLE job_applications 
ADD COLUMN origin TEXT DEFAULT 'candidate';

COMMENT ON COLUMN job_applications.origin IS 'Source of the application: candidate (website) or operator (dashboard)';
