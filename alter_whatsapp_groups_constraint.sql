-- Remove the existing unique constraint that prevents the same group ID globally
ALTER TABLE public.whatsapp_groups
DROP CONSTRAINT IF EXISTS whatsapp_groups_id_group_unique;

-- Add a new composite unique constraint
-- This ensures a user cannot have the same group twice, but allows DIFFERENT users to have the same group.
ALTER TABLE public.whatsapp_groups
ADD CONSTRAINT whatsapp_groups_user_id_group_unique UNIQUE (user_id, id_group);
