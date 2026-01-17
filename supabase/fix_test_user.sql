DO $$
DECLARE
    -- ID fixo para o usuário, para facilitar limpeza e recreação
    -- (Gerando um novo aqui para garantir limpeza)
    target_user_id uuid := gen_random_uuid(); 
    target_phone text := '5511946617052';
    target_email text := target_phone || '@temp.lepps.com';
    target_password text := 'senha_temporaria_n8n';
BEGIN
    -- 1. LIMPEZA: Remove o usuário antigo se existir (pelo telefone ou email)
    DELETE FROM auth.users WHERE email = target_email;
    DELETE FROM public.profiles WHERE whatsapp = target_phone;
    -- (Cascades devem limpar o resto, mas por segurança...)
    DELETE FROM whatsapp_login_codes WHERE phone = target_phone;
    
    -- 2. INSERIR EM AUTH.USERS
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
        updated_at,
        phone,       -- Adicionando phone aqui também por consistência, se permitido
        confirmation_token
    ) VALUES (
        target_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        target_email,
        crypt(target_password, gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('whatsapp', target_phone, 'full_name', 'Usuario Teste N8N', 'role', 'candidato'),
        false,
        now(),
        now(),
        NULL, -- Phone null no auth.users é padrão para login email
        encode(gen_random_bytes(32), 'hex')
    );

    -- 3. INSERIR EM AUTH.IDENTITIES (CRUCIAL PARA O ERRO 'Database error loading user')
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at,
        email
    ) VALUES (
        target_user_id, -- ID da identidade igual ao User ID para email provider
        target_user_id,
        jsonb_build_object('sub', target_user_id, 'email', target_email, 'email_verified', true, 'phone_verified', false),
        'email',
        target_user_id, -- provider_id = user_id para email
        now(),
        now(),
        now(),
        target_email
    );

    -- 4. INSERIR EM PUBLIC.PROFILES
    INSERT INTO public.profiles (
        id,
        full_name,
        whatsapp,
        status_created
    ) VALUES (
        target_user_id,
        'Usuario Teste N8N',
        target_phone,
        0
    );

    RAISE NOTICE '✅ Usuário corrigido com sucesso! ID: %', target_user_id;

END $$;
