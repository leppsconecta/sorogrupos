-- Ensure companies are viewable by everyone
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public companies view" ON companies;

CREATE POLICY "Public companies view"
ON companies FOR SELECT
USING (true);

-- Ensure jobs are viewable by everyone, but filtered by status
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public jobs view" ON jobs;

CREATE POLICY "Public jobs view"
ON jobs FOR SELECT
USING (status = 'active' AND (public_hidden = false OR public_hidden IS NULL));

-- Ensure resumes bucket is public writable (for applications)
-- Note: Storage policies are handled differently in Supabase SQL usually, 
-- but we can try to set it if table-based RLS for storage.objects exists.
-- For now, we assume storage bucket 'resumes' is set to public or has policies.
