-- SCRIPT DE LIMPEZA E CONSOLIDAÇÃO DE GATILHOS (FIX DUPLICATE FOLDERS)
-- Execute este script no Editor SQL do Supabase.

-- 1. Remover TODOS os gatilhos antigos conhecidos na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_consolidated ON auth.users;
-- Adicione outros nomes se suspeitar de mais algum, ex:
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- 2. Remover funções antigas para limpeza (Opcional, mas recomendado para evitar confusão)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Recriar a FUNÇÃO DEFINITIVA "handle_new_user_consolidated"
-- Esta função centraliza TODA a lógica de criação pós-cadastro.
CREATE OR REPLACE FUNCTION public.handle_new_user_consolidated() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE
  new_company_folder_id uuid;
BEGIN
  -- A. Cria o Perfil
  BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, email, status_created, updated_at)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
      new.raw_user_meta_data->>'avatar_url', 
      new.email,
      1, -- status_created = 1 para indicar que o perfil "basico" existe
      NOW()
    )
    ON CONFLICT (id) DO NOTHING; -- Evita erro se já existir (raro em insert, mas possivel em re-execução)
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
  END;

  -- B. Cria conexão WhatsApp (status desconectado)
  BEGIN
    INSERT INTO public.whatsapp_conections (user_id, status)
    VALUES (new.id, 'desconectado')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar whatsapp_conections: %', SQLERRM;
  END;

  -- C. Cria Emojis Padrão
  BEGIN
    INSERT INTO public.user_job_emojis (user_id, emojis)
    VALUES (new.id, '🟡🔴🔵')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar emojis: %', SQLERRM;
  END;

  -- D. Cria Pasta de Empresa Padrão (Carrefour)
  -- VERIFICAÇÃO EXTRA: Só cria se NÃO existir nenhuma pasta de empresa para este usuário ainda.
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.folder_companies WHERE user_id = new.id) THEN
        INSERT INTO public.folder_companies (name, user_id)
        VALUES ('Carrefour', new.id)
        RETURNING id INTO new_company_folder_id;
        
        -- E. Se criou a empresa, cria o Setor Padrão (Aux. Administrativo)
        IF new_company_folder_id IS NOT NULL THEN
            INSERT INTO public.sectors (name, folder_company_id)
            VALUES ('Ax. Administrativo', new_company_folder_id);
        END IF;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar pastas padrão: %', SQLERRM;
  END;

  -- F. Cria dados iniciais da tabela "companies" (Para o Onboarding não vir vazio)
  BEGIN
    INSERT INTO public.companies (owner_id, name, email)
    VALUES (
        new.id, 
        'Sua Empresa', 
        new.email
    )
    ON CONFLICT (owner_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
     RAISE WARNING 'Erro ao criar company placeholder: %', SQLERRM;
  END;
  
  -- G. Cria conta do usuário (UserAccount) - Trial
  BEGIN
    INSERT INTO public.user_accounts (user_id, status)
    VALUES (new.id, 'trial')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
     RAISE WARNING 'Erro ao criar user_account: %', SQLERRM;
  END;

  RETURN new;
END;
$$;

-- 4. Reativar o ÚNICO gatilho necessário
CREATE TRIGGER on_auth_user_created_consolidated
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_consolidated();

-- 5. Grants finais
GRANT ALL ON TABLE public.profiles TO postgres, service_role;
GRANT ALL ON TABLE public.whatsapp_conections TO postgres, service_role;
GRANT ALL ON TABLE public.folder_companies TO postgres, service_role;
GRANT ALL ON TABLE public.sectors TO postgres, service_role;
GRANT ALL ON TABLE public.companies TO postgres, service_role;
GRANT ALL ON TABLE public.user_accounts TO postgres, service_role;
