DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
    test_phone text := '5511946617052'; -- TELEFONE DE TESTE DEFINIDO
    test_email text := test_phone || '@temp.lepps.com';
BEGIN
    -- 1. Inserir na tabela de Autenticação (Simulando criar usuário)
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        test_email,
        crypt('senha_temporaria_n8n', gen_salt('bf')), -- Senha dummy
        now(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('whatsapp', test_phone, 'full_name', 'Usuario Teste N8N'),
        false,
        now(),
        now()
    );

    -- 2. Inserir no Perfil Público (Simulando o N8N criando dados iniciais)
    INSERT INTO public.profiles (
        id,
        full_name,
        whatsapp,
        status_created, -- IMPORTANTE: 0 para forçar o Onboarding aparecer
        role
    ) VALUES (
        new_user_id,
        'Usuario Teste N8N',
        test_phone,
        0, -- 0 = Onboarding Pendente
        'candidato'
    ) ON CONFLICT (id) DO UPDATE SET status_created = 0;

    -- O Trigger 'handle_new_profile_whatsapp_code' roda automaticamente aqui!

    RAISE NOTICE '✅ Usuário criado! Tente logar com o WhatsApp: %', test_phone;
END $$;
