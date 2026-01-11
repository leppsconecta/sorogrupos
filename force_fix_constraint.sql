DO $$
BEGIN
    -- 1. Try to drop the explicit unique constraint 'whatsapp_groups_id_group_unique'
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_groups_id_group_unique') THEN
        ALTER TABLE public.whatsapp_groups DROP CONSTRAINT whatsapp_groups_id_group_unique;
        RAISE NOTICE 'Constraint whatsapp_groups_id_group_unique dropped.';
    ELSE
        RAISE NOTICE 'Constraint whatsapp_groups_id_group_unique did not exist.';
    END IF;

    -- 2. Try to drop the default unique constraint 'whatsapp_groups_id_group_key' (just in case)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_groups_id_group_key') THEN
        ALTER TABLE public.whatsapp_groups DROP CONSTRAINT whatsapp_groups_id_group_key;
        RAISE NOTICE 'Constraint whatsapp_groups_id_group_key dropped.';
    END IF;

    -- 3. Add the new composite constraint (user_id + id_group uniqueness)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_groups_user_id_group_unique') THEN
        ALTER TABLE public.whatsapp_groups ADD CONSTRAINT whatsapp_groups_user_id_group_unique UNIQUE (user_id, id_group);
        RAISE NOTICE 'New unique constraint (user_id, id_group) added.';
    ELSE
         RAISE NOTICE 'Constraint whatsapp_groups_user_id_group_unique already exists.';
    END IF;
END $$;
