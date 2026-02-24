-- Add short_id to companies
ALTER TABLE "public"."companies" ADD COLUMN IF NOT EXISTS "short_id" text UNIQUE;

-- Function to generate a random 4-4 digit ID
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS text AS $$
DECLARE
    new_id text;
    is_unique boolean;
BEGIN
    LOOP
        -- Generate something like '1254-6582'
        new_id := (floor(random() * 9000 + 1000)::text) || '-' || (floor(random() * 9000 + 1000)::text);
        
        -- Check if it exists
        SELECT NOT EXISTS (
            SELECT 1 FROM public.companies WHERE short_id = new_id
        ) INTO is_unique;
        
        EXIT WHEN is_unique;
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Trigger function to automatically set short_id if it's null
CREATE OR REPLACE FUNCTION set_company_short_id()
RETURNS trigger AS $$
BEGIN
    IF NEW.short_id IS NULL THEN
        NEW.short_id := generate_short_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to ensure it's up to date
DROP TRIGGER IF EXISTS ensure_company_short_id ON public.companies;

CREATE TRIGGER ensure_company_short_id
BEFORE INSERT OR UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION set_company_short_id();

-- Safely backfill existing rows that don't have a short_id
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.companies WHERE short_id IS NULL LOOP
        UPDATE public.companies SET short_id = generate_short_id() WHERE id = r.id;
    END LOOP;
END;
$$;
