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
            return new Response(
                JSON.stringify({ error: 'Código inválido ou expirado. Tente novamente.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } } // Return 200 so client can read message
            )
        }

        // Check if code was already "used" (we mark it by changing it to something invalid, or check updated_at)
        // For now, if the code matches what's in the DB, we proceed.

        const userId = codeRecord.user_id
        if (!userId) {
            return new Response(
                JSON.stringify({ error: 'Erro interno: Código sem usuário vinculado' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 3. Get exact phone for login from Auth User (MOVED UP FOR DEBUGGING)
        console.log('Fetching user data for:', userId)
        const { data: userData, error: userError } = await sbAdmin.auth.admin.getUserById(userId)

        if (userError || !userData.user) {
            console.error('Get User Error:', userError)
            return new Response(
                JSON.stringify({ error: 'Usuário não encontrado no Auth (Get): ' + (userError?.message || '') }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const userEmail = userData.user.email
        console.log('User found:', userEmail)

        // 2. Generate Session via Temp Password
        const tempPassword = crypto.randomUUID()
        console.log('Updating password for user:', userId)

        // Set temp password
        try {
            const { error: updateError } = await sbAdmin.auth.admin.updateUserById(userId, {
                password: tempPassword
            })
            if (updateError) {
                console.error('Update User Error:', updateError)
                throw new Error('Falha ao atualizar senha temporária: ' + updateError.message)
            }
        } catch (err: any) {
            console.error('Catch Update User:', err)
            throw new Error('Erro ao atualizar usuário (' + userId + '): ' + err.message)
        }

        console.log('Signing in as:', userEmail)

        // 4. Sign In using the temp password (using EMAIL instead of phone for reliability)
        const { data: authData, error: authError } = await sbPublic.auth.signInWithPassword({
            email: userEmail,
            password: tempPassword
        })

        if (authError || !authData.session) {
            console.error('Auth Signin error:', authError)
            return new Response(
                JSON.stringify({ error: 'Falha ao gerar sessão de login: ' + authError.message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
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
            JSON.stringify({ error: 'Erro no servidor: ' + error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } } // 200 OK to allow reading body
        )
    }
})
