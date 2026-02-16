-- Add status and note columns to candidates table
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Válido' CHECK (status IN ('Válido', 'Bloqueado')),
ADD COLUMN IF NOT EXISTS note TEXT;

-- Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS candidates_created_at_idx ON public.candidates (created_at DESC);
