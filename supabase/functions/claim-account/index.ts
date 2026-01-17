import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("Request received. Headers:", JSON.stringify(Object.fromEntries(req.headers.entries())))

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 1. Get the user from the JWT (Security Check)
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            console.error("User not found in JWT verification step.")
            throw new Error('Unauthorized - User not found')
        }

        const { email, password, phone, fullName, companyData } = await req.json()

        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!serviceKey) {
            console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in env.")
            throw new Error('Server misconfiguration: missing service role key')
        }

        // 2. Admin Client for privileged updates
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            serviceKey
        )

        console.log('Claiming account for user:', user.id, 'New Email:', email)

        // 3. Update Auth User (Email, Password, Phone, Metadata)
        // We use Admin to bypass email verification requirement if desired, 
        // or simply to ensure it happens reliably even if user session is weird.
        // Setting email_confirm: true implicitly confirms the email if using admin.updateUserById? 
        // Actually admin.updateUserById updates immediately.

        const updatePayload: any = {
            email: email,
            password: password,
            phone: phone,
            email_confirm: true, // Auto-confirm the new email
            user_metadata: {
                ...user.user_metadata,
                full_name: fullName,
                tipo: 'real', // No longer phantom
                status_claimed: true
            }
        }

        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            updatePayload
        )

        if (authError) {
            console.error('Auth update error:', authError)
            throw new Error('Falha ao atualizar credenciais: ' + authError.message)
        }

        // 4. Update Public Profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: fullName,
                whatsapp: phone,
                status_created: 1,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (profileError) throw profileError

        // 5. Update Company
        // Check if exists
        const { data: existingCompany } = await supabaseAdmin
            .from('companies')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle()

        if (existingCompany) {
            const { error: companyError } = await supabaseAdmin
                .from('companies')
                .update({ ...companyData, owner_id: user.id, status_created: 1 })
                .eq('id', existingCompany.id)
            if (companyError) throw companyError
        } else {
            const { error: companyError } = await supabaseAdmin
                .from('companies')
                .insert([{ ...companyData, owner_id: user.id, status_created: 1 }])
            if (companyError) throw companyError
        }

        // 6. Refresh Session? 
        // The frontend will need to re-authenticate or refresh, but since we changed the password/email, 
        // the current token might persist but the next login will use new creds.

        return new Response(
            JSON.stringify({ success: true, message: 'Conta atualizada com sucesso!' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Error claiming account:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
