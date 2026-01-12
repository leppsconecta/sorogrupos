
import { Stripe } from "https://esm.sh/stripe@14.10.0?target=deno"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // 1. Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Load and Validate Secret Key
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            console.error("Missing STRIPE_SECRET_KEY");
            throw new Error("Server Misconfiguration: Missing Stripe Key");
        }

        // 3. Initialize Stripe
        const stripe = new Stripe(stripeKey, {
            apiVersion: '2023-10-16', // Updated API version
            httpClient: Stripe.createFetchHttpClient(),
        })

        // 4. Parse Request
        const { priceId, mode, successUrl, cancelUrl, userId, userEmail } = await req.json()

        if (!priceId || !mode || !userId) {
            throw new Error('Missing required fields: priceId, mode, userId')
        }

        console.log(`Creating session: User=${userId}, Mode=${mode}, Price=${priceId}`);

        // 5. Create Session
        const paymentMethodTypes = mode === 'subscription' ? ['card'] : ['card', 'pix'];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: paymentMethodTypes,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode,
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: userEmail,
            client_reference_id: userId,
            metadata: {
                user_id: userId,
            },
        })

        // 6. Return Success URL
        return new Response(
            JSON.stringify({ url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )

    } catch (error: any) {
        console.error('Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Returning 200 so frontend can read the error JSON
            },
        )
    }
})
