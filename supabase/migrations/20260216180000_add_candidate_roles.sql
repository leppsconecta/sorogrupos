-- Add cargo_principal and cargos_extras columns to candidates table

ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS cargo_principal TEXT,
ADD COLUMN IF NOT EXISTS cargos_extras JSONB DEFAULT '[]'::jsonb;
