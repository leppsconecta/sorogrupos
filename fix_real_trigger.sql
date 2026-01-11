-- CORREÇÃO DEFINITIVA DO GATILHO "CONSOLIDATED"
-- O seu banco de dados está usando um gatilho chamado "on_auth_user_created_consolidated" que não foi afetado pelos scripts anteriores.

-- 1. Remover o gatilho problemático
DROP TRIGGER IF EXISTS on_auth_user_created_consolidated ON auth.users;

-- 2. Recriar a função "handle_new_user_consolidated" com proteção contra falhas (Try/Catch)
CREATE OR REPLACE FUNCTION public.handle_new_user_consolidated() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  -- Tenta criar o Perfil
  BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, email)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
      new.raw_user_meta_data->>'avatar_url', 
      new.email
    );
  EXCEPTION WHEN OTHERS THEN
    -- Apenas loga o aviso, mas NÃO trava o cadastro
    RAISE WARNING 'Erro ao criar perfil no gatilho consolidado: %', SQLERRM;
  END;

  -- Tenta criar a conexão do WhatsApp (que estava causando o erro 500)
  BEGIN
    INSERT INTO public.whatsapp_conections (user_id, status)
    VALUES (new.id, 'desconectado');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar whatsapp_conections no gatilho consolidado: %', SQLERRM;
  END;

  RETURN new;
END;
$$;

-- 3. Reativar o gatilho "consolidated" apontando para a função protegida
CREATE TRIGGER on_auth_user_created_consolidated
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_consolidated();

-- 4. Garantir permissões
GRANT ALL ON TABLE public.whatsapp_conections TO postgres, service_role;
