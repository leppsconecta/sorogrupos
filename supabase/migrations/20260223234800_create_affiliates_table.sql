-- CREATE TABLE AFFILIATES

CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Garante a relação 1:1 
    CONSTRAINT affiliates_user_id_key UNIQUE (user_id),
    
    -- Garante que nenhum código se repita em toda a plataforma
    CONSTRAINT affiliates_code_key UNIQUE (code)
);

-- RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read their own affiliate data"
ON public.affiliates
FOR SELECT
USING (auth.uid() = user_id);

-- Geração de Código
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Sem O, 0, I, l, 1
    result TEXT := '';
    i INTEGER := 0;
    is_unique BOOLEAN := false;
BEGIN
    LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        -- Verifica se já existe na tabela affiliates
        SELECT NOT EXISTS (
            SELECT 1 FROM public.affiliates WHERE code = result
        ) INTO is_unique;
        
        EXIT WHEN is_unique;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Inserção Transparente Automática
CREATE OR REPLACE FUNCTION public.handle_new_user_affiliate()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.affiliates (user_id, code)
    VALUES (NEW.id, public.generate_affiliate_code());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_affiliate ON auth.users;

CREATE TRIGGER on_auth_user_created_affiliate
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_affiliate();

-- Backfill para usuários existentes (Criar registro de afiliado para contas atuais que não têm)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.affiliates a WHERE a.user_id = u.id) LOOP
        INSERT INTO public.affiliates (user_id, code) VALUES (r.id, public.generate_affiliate_code());
    END LOOP;
END;
$$;
