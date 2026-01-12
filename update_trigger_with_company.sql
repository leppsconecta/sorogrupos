-- ATUALIZAÇÃO DO GATILHO PARA CRIAR EMPRESA PADRÃO
-- Objetivo: Criar as pastas de empresa e setor automaticamente no banco de dados
-- para evitar delay e "pisca" do modal de onboarding no frontend.

CREATE OR REPLACE FUNCTION public.handle_new_user_consolidated() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE
  new_company_folder_id uuid;
BEGIN
  -- 1. Cria o Perfil
  BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, email)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
      new.raw_user_meta_data->>'avatar_url', 
      new.email
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
  END;

  -- 2. Cria conexão WhatsApp (status desconectado)
  BEGIN
    INSERT INTO public.whatsapp_conections (user_id, status)
    VALUES (new.id, 'desconectado');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar whatsapp_conections: %', SQLERRM;
  END;

  -- 3. Cria Emojis Padrão
  BEGIN
    INSERT INTO public.user_job_emojis (user_id, emojis)
    VALUES (new.id, '🟡🔴🔵');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar emojis: %', SQLERRM;
  END;

  -- 4. Cria Pasta de Empresa Padrão (Carrefour)
  BEGIN
    INSERT INTO public.folder_companies (name, user_id)
    VALUES ('Carrefour', new.id)
    RETURNING id INTO new_company_folder_id;
    
    -- 5. Se criou a empresa, cria o Setor Padrão (Aux. Administrativo)
    IF new_company_folder_id IS NOT NULL THEN
      INSERT INTO public.sectors (name, folder_company_id)
      VALUES ('Ax. Administrativo', new_company_folder_id);
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar pastas padrão: %', SQLERRM;
  END;

  RETURN new;
END;
$$;
