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
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { phone } = await req.json()
        if (!phone) throw new Error('Phone is required')

        // Clean input: remove ALL non-digits
        const rawDigits = phone.replace(/\D/g, '')

        // Variants array
        let digitsWithoutCountry = rawDigits
        if (rawDigits.startsWith('55') && rawDigits.length > 11) {
            digitsWithoutCountry = rawDigits.slice(2)
        }

        // We check against whatsapp_login_codes table NOW!
        // This is the source of truth for "Onboarded Users"
        const possibleFormats = [
            digitsWithoutCountry,             // 11999999999
            `55${digitsWithoutCountry}`,      // 5511999999999
            `+55${digitsWithoutCountry}`      // +5511999999999
        ]

        console.log('Searching in whatsapp_login_codes for:', possibleFormats)

        const { data: record, error: dbError } = await supabase
            .from('whatsapp_login_codes')
            .select('user_id, phone')
            .in('phone', possibleFormats)
            .maybeSingle()

        if (dbError) {
            console.error('Database error:', dbError)
            throw new Error('Erro ao buscar registro.')
        }

        if (!record) {
            return new Response(
                JSON.stringify({ error: 'Cadastro incompleto ou não encontrado.', not_found: true }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const userId = record.user_id

        // Call n8n
        const webhookUrl = 'https://webhook.leppsconecta.com.br/webhook/7cff36c9-1be5-4c93-a70d-6577b2d42555'

        // Send standard format to n8n
        const n8nPhone = `+55${digitsWithoutCountry}`

        // n8n will UPDATE the existing record for this user_id
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: n8nPhone, user_id: userId })
        })

        if (!response.ok) {
            console.error('n8n response error:', await response.text())
            throw new Error('Falha ao enviar solicitação para o WhatsApp (Erro no provedor).')
        }

        return new Response(
            JSON.stringify({ success: true, user_id: userId }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
