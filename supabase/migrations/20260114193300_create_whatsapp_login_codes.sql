create table if not exists public.whatsapp_login_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  user_id uuid references auth.users(id),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '10 minutes')
);

create index if not exists idx_whatsapp_login_codes_phone on public.whatsapp_login_codes(phone);

alter table public.whatsapp_login_codes enable row level security;

-- Allow Service Role (Edge Functions & n8n via connection string) full access
create policy "Enable access for service role"
  on public.whatsapp_login_codes
  for all
  to service_role
  using (true)
  with check (true);
