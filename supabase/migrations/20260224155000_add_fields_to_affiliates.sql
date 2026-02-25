-- 20260224155000_add_fields_to_affiliates.sql
-- Adiciona campos extras coletados no onboarding do afiliado

ALTER TABLE public.affiliates
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;
