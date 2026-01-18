-- Add logo_url and cover_url columns to companies table
ALTER TABLE companies
ADD COLUMN logo_url TEXT,
ADD COLUMN cover_url TEXT;
