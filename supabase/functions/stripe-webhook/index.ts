
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Stripe } from "https://esm.sh/stripe@12.0.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

serve(async (req) => {
    try {
        const signature = req.headers.get('stripe-signature')

        // NOTE: In production, verifying the signature is crucial.
        // For local dev, sometimes we skip or use the locally provided secret.
        // Here we assume standard setup.

        const body = await req.text()
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
            apiVersion: '2022-11-15',
            httpClient: Stripe.createFetchHttpClient(),
        })

        let event;
        try {
            if (endpointSecret) {
                event = stripe.webhooks.constructEvent(body, signature!, endpointSecret)
            } else {
                // Fallback for simple testing without secret verification (NOT RECOMMENDED for Prod)
                // But useful if secret env var is missing during initial dev
                const json = JSON.parse(body)
                event = json;
            }
        } catch (err) {
            console.error(`⚠️  Webhook signature verification failed.`, err.message)
            return new Response(err.message, { status: 400 })
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log(`🔔 Event received: ${event.type}`)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            const userId = session.client_reference_id
            const subscriptionId = session.subscription
            const paymentIntentId = session.payment_intent
            const mode = session.mode // 'subscription' or 'payment'

            console.log(`Processing checkout for User: ${userId}, Mode: ${mode}`)

            // 1. Log Payment
            await supabase.from('user_payments').insert({
                user_id: userId,
                stripe_payment_intent_id: paymentIntentId || session.id, // Fallback to session ID if no PI
                amount: session.amount_total,
                status: session.payment_status,
                created_at: new Date().toISOString()
            })

            // 2. Update Subscription
            // Calculate end date
            let currentPeriodEnd = new Date()
            if (mode === 'subscription') {
                // Should fetch sub details for exact date, but usually +1 month
                // Better: Let the 'invoice.payment_succeeded' handle explicit dates for subs?
                // No, checkout completion is the first signal.
                // Let's rely on retrieving the subscription object if we want exact dates.
                const sub = await stripe.subscriptions.retrieve(subscriptionId as string)
                currentPeriodEnd = new Date(sub.current_period_end * 1000)
            } else {
                // One-time payment (1 month access)
                currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
            }

            const { error } = await supabase.from('user_subscriptions').upsert({
                user_id: userId,
                status: 'active',
                type: mode === 'subscription' ? 'recurring' : 'one_time',
                current_period_end: currentPeriodEnd.toISOString(),
                stripe_subscription_id: subscriptionId,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

            if (error) console.error('Error updating sub:', error)
            else console.log('Subscription updated successfully.')
        }

        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object
            const subscriptionId = invoice.subscription

            // If this is a subscription renewal
            if (subscriptionId) {
                const sub = await stripe.subscriptions.retrieve(subscriptionId as string)
                const userId = sub.metadata?.user_id || invoice.metadata?.user_id // Metadata might be on sub or customer

                // If we can't find userId in metadata, we might need to lookup by stripe_customer_id in our DB.
                // But for now, let's assume we can lookup the subscription in our DB

                const { data: existingSub } = await supabase
                    .from('user_subscriptions')
                    .select('user_id')
                    .eq('stripe_subscription_id', subscriptionId)
                    .single()

                if (existingSub) {
                    await supabase.from('user_subscriptions').update({
                        status: 'active',
                        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                        updated_at: new Date().toISOString()
                    }).eq('user_id', existingSub.user_id)
                    console.log(`Renewal updated for user ${existingSub.user_id}`)
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Error handling request:', error.message)
        return new Response(error.message, { status: 500 })
    }
})
