-- CREATE TABLE REFERRALS

CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- pending, active
    
    -- Evita que um mesmo usuário seja indicado duas vezes 
    CONSTRAINT referrals_referred_user_id_key UNIQUE (referred_user_id)
);

-- RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can only read their own referrals"
ON public.referrals
FOR SELECT
USING (
    affiliate_id IN (
        SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
);

-- Interceptar metadado no auth.users para gravar o referral
CREATE OR REPLACE FUNCTION public.handle_new_user_referral_check()
RETURNS trigger AS $$
DECLARE
    inbound_ref_code TEXT;
    target_affiliate_id UUID;
BEGIN
    -- Verifica se o metadado referral_code existe no JSON do usuário
    IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
        inbound_ref_code := NEW.raw_user_meta_data->>'referral_code';
        
        -- Busca se o código pertence a um affiliate ativo
        SELECT id INTO target_affiliate_id 
        FROM public.affiliates 
        WHERE code = inbound_ref_code;
        
        -- Se encontrou o dono do código, insere o lead pra ele
        IF target_affiliate_id IS NOT NULL THEN
            INSERT INTO public.referrals (affiliate_id, referred_user_id, status)
            VALUES (target_affiliate_id, NEW.id, 'active');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- OBS: Disparar ANTES de gerar o affiliate para o proprio recem-chegado, se houver choque
DROP TRIGGER IF EXISTS on_auth_user_referral_check ON auth.users;

CREATE TRIGGER on_auth_user_referral_check
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_referral_check();
