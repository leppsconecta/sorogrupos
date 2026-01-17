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
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 1. Verify User from JWT
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('Unauthorized')
        }

        const { phone, fullName } = await req.json()

        if (!phone) {
            throw new Error('Phone is required')
        }

        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!serviceKey) {
            throw new Error('Server misconfiguration')
        }

        // 2. Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            serviceKey
        )

        console.log(`Updating account for user ${user.id}: Phone=${phone}, Name=${fullName}`)

        // 3. Update auth.users
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            {
                phone: phone,
                phone_confirm: true,
                user_metadata: { ...user.user_metadata, full_name: fullName }
            }
        )

        if (authError) throw authError

        // 4. Update profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                whatsapp: phone,
                full_name: fullName,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (profileError) throw profileError

        // 5. Update whatsapp_login_codes
        // Update all records for this user? Or just recent? User said "whatsapp code"
        // Let's update all for consistency or the latest.
        // Updating all matching user_id seems safest to ensure consistency.
        const { error: codeError } = await supabaseAdmin
            .from('whatsapp_login_codes')
            .update({ phone: phone })
            .eq('user_id', user.id)

        if (codeError) {
            console.warn("Error updating whatsapp_login_codes:", codeError)
            // Not critical enough to fail the whole request? Or IS it?
            // User explicitly asked for it. Let's throw.
            throw codeError
        }

        // 6. Update company contact if it matches old phone?
        // User didn't strictly ask for this, but 'profiles' is personal data.
        // I will stick to the request: user_id (auth), whatsapp code, profile.

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Error updating phone:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
