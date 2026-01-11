-- PASSO 1: Desativar temporariamente o gatilho para testar se ele é a causa do erro.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- PASSO 2: Listar gatilhos existentes na tabela users (para verificar se há outros com nomes diferentes)
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- Instruções:
-- 1. Rode este script.
-- 2. Tente cadastrar um usuário no site.
-- 3. Se funcionar, o problema era o gatilho. Me avise para eu te enviar a versão corrigida (Lite).
-- 4. Se ainda der erro, verifique o resultado do SELECT abaixo para ver se existem outros gatilhos ativos.
