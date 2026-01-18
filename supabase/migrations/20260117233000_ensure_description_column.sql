-- Ensure description column exists
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description text;

-- Ensure whatsapp column exists (used for contact button)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp text;
