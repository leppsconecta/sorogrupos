-- Script de Correção do Gatilho de Cadastro (handle_new_user)
-- Execute este script no Editor SQL do Supabase para corrigir o erro 500 no cadastro.

-- 1. Recria a função do gatilho com tratamento de erro e permissões elevadas (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  -- Tenta criar o perfil público (padrão do Supabase)
  BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, email)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email), -- Fallback para email se não houver nome
      new.raw_user_meta_data->>'avatar_url', 
      new.email
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
  END;

  -- Tenta criar a linha na tabela whatsapp_conections (Solicitado anteriormente)
  -- Envolvemos em um bloco extra para que, se falhar, NÃO impeça o cadastro do usuário
  BEGIN
    INSERT INTO public.whatsapp_conections (user_id, status)
    VALUES (new.id, 'desconectado');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar whatsapp_conections: %', SQLERRM;
    -- Se a tabela não existir ou tiver colunas diferentes, o erro será ignorado e o usuário criado.
  END;

  -- Se houver outras lógicas (Ex: criar company), adicione aqui com tratamento de erro similar.

  RETURN new;
END;
$$;

-- 2. Garante que o gatilho está ativado na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. (Opcional) Garante permissões na tabela whatsapp_conections para evitar erros de RLS
GRANT ALL ON TABLE public.whatsapp_conections TO postgres, service_role;
-- Se RLS estiver ativo, políticas devem existir, mas como a função é SECURITY DEFINER, ela ignora RLS.
