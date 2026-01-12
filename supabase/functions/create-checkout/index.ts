
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        const keyStatus = stripeKey ? `Present (Starts with ${stripeKey.substring(0, 7)}...)` : 'Missing';

        return new Response(
            JSON.stringify({
                message: "Native Deno.serve Mode: Function is Alive!",
                keyStatus: keyStatus,
                timestamp: new Date().toISOString()
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown Error' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    }
})
