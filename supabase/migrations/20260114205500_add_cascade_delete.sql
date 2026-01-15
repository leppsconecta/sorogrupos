-- Migration to add ON DELETE CASCADE to all user-related foreign keys

-- 1. Profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Companies
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_owner_id_fkey;
ALTER TABLE public.companies ADD CONSTRAINT companies_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Support Tickets
ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. WhatsApp Connections
ALTER TABLE public.whatsapp_conections DROP CONSTRAINT IF EXISTS whatsapp_conections_user_id_fkey;
ALTER TABLE public.whatsapp_conections ADD CONSTRAINT whatsapp_conections_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. WhatsApp Groups
ALTER TABLE public.whatsapp_groups DROP CONSTRAINT IF EXISTS whatsapp_groups_user_id_fkey;
ALTER TABLE public.whatsapp_groups ADD CONSTRAINT whatsapp_groups_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Tags Group
ALTER TABLE public.tags_group DROP CONSTRAINT IF EXISTS tags_group_user_id_fkey;
ALTER TABLE public.tags_group ADD CONSTRAINT tags_group_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. Jobs
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_user_id_fkey;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 8. Folder Companies
ALTER TABLE public.folder_companies DROP CONSTRAINT IF EXISTS folder_companies_user_id_fkey;
ALTER TABLE public.folder_companies ADD CONSTRAINT folder_companies_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 9. WhatsApp Login Codes
ALTER TABLE public.whatsapp_login_codes DROP CONSTRAINT IF EXISTS whatsapp_login_codes_user_id_fkey;
ALTER TABLE public.whatsapp_login_codes ADD CONSTRAINT whatsapp_login_codes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 10. Saved Job Contacts
ALTER TABLE public.saved_job_contacts DROP CONSTRAINT IF EXISTS saved_job_contacts_user_id_fkey;
ALTER TABLE public.saved_job_contacts ADD CONSTRAINT saved_job_contacts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 11. User Job Emojis
ALTER TABLE public.user_job_emojis DROP CONSTRAINT IF EXISTS user_job_emojis_user_id_fkey;
ALTER TABLE public.user_job_emojis ADD CONSTRAINT user_job_emojis_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 12. Marketing Schedules
ALTER TABLE public.marketing_schedules DROP CONSTRAINT IF EXISTS marketing_schedules_user_id_fkey;
ALTER TABLE public.marketing_schedules ADD CONSTRAINT marketing_schedules_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 13. User Accounts
ALTER TABLE public.user_accounts DROP CONSTRAINT IF EXISTS user_accounts_user_id_fkey;
ALTER TABLE public.user_accounts ADD CONSTRAINT user_accounts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 14. User Subscriptions
ALTER TABLE public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey;
ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 15. User Payments
ALTER TABLE public.user_payments DROP CONSTRAINT IF EXISTS user_payments_user_id_fkey;
ALTER TABLE public.user_payments ADD CONSTRAINT user_payments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
