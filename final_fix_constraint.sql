-- "Nuclear" Option to remove the stubborn constraint/index

-- 1. Drop the constraint explicitly
ALTER TABLE public.whatsapp_groups DROP CONSTRAINT IF EXISTS whatsapp_groups_id_group_unique;

-- 2. Drop the index explicitly (sometimes an index remains even if constraint is gone, or if it was just an index)
DROP INDEX IF EXISTS public.whatsapp_groups_id_group_unique;

-- 3. Just to be safe, drop the key if it exists under the default name
ALTER TABLE public.whatsapp_groups DROP CONSTRAINT IF EXISTS whatsapp_groups_id_group_key;
DROP INDEX IF EXISTS public.whatsapp_groups_id_group_key;

-- 4. Verify we still have the CORRECT constraint
-- (We re-add it just in case, using IF NOT EXISTS logic via a DO block)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_groups_user_id_group_unique') THEN
        ALTER TABLE public.whatsapp_groups ADD CONSTRAINT whatsapp_groups_user_id_group_unique UNIQUE (user_id, id_group);
    END IF;
END $$;
