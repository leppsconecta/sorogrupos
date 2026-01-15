create or replace function public.get_user_id_by_phone(phone_number text)
returns uuid
language sql
security definer
set search_path = public, auth 
as $$
  select id from auth.users where phone = phone_number limit 1;
$$;
