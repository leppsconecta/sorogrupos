import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const sbAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // We need a public client to perform the signIn (as if it were the user)
        const sbPublic = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )

        const { phone, code } = await req.json()
        if (!phone || !code) throw new Error('Phone and Code are required')

        const rawDigits = phone.replace(/\D/g, '')
        let digitsWithoutCountry = rawDigits
        if (rawDigits.startsWith('55') && rawDigits.length > 11) {
            digitsWithoutCountry = rawDigits.slice(2)
        }

        const possibleFormats = [
            digitsWithoutCountry,
            `55${digitsWithoutCountry}`,
            `+55${digitsWithoutCountry}`
        ]

        console.log('Verifying code for:', possibleFormats)

        // 1. Verify Code in DB
        const { data: codeRecord, error: dbError } = await sbAdmin
            .from('whatsapp_login_codes')
            .select('*')
            .in('phone', possibleFormats)
            .eq('code', code)
            .maybeSingle()

        if (dbError) throw dbError

        if (!codeRecord) {
            throw new Error('Código inválido ou expirado. Tente novamente.')
        }

        // Check if code was already "used" (we mark it by changing it to something invalid, or check updated_at)
        // For now, if the code matches what's in the DB, we proceed.

        const userId = codeRecord.user_id
        if (!userId) throw new Error('Erro interno: Código sem usuário vinculado')

        // 2. Generate Session via Temp Password
        const tempPassword = crypto.randomUUID()

        // Set temp password
        const { error: updateError } = await sbAdmin.auth.admin.updateUserById(userId, {
            password: tempPassword
        })

        if (updateError) throw updateError

        // 3. Get exact phone for login from Auth User (to avoid format mismatch during sign in)
        const { data: userData, error: userError } = await sbAdmin.auth.admin.getUserById(userId)
        if (userError || !userData.user) throw new Error('Usuário não encontrado no Auth')

        const userPhone = userData.user.phone

        // 4. Sign In using the temp password
        const { data: authData, error: authError } = await sbPublic.auth.signInWithPassword({
            phone: userPhone,
            password: tempPassword
        })

        if (authError || !authData.session) {
            console.error('Auth error:', authError)
            throw new Error('Falha ao gerar sessão de login: ' + authError.message)
        }

        // 5. Invalidate Code (prevent replay)
        // We update the code to a 'USED' state instead of deleting the row, 
        // because we want to keep the row for the next login (refillable).
        await sbAdmin
            .from('whatsapp_login_codes')
            .update({ code: 'USED_' + Date.now() })
            .eq('id', codeRecord.id)

        return new Response(
            JSON.stringify({
                session: authData.session,
                user: authData.user
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
