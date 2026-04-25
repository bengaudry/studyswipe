import { Button } from '@/components/ui'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/session'

export default async function CancelSubscriptionPage() {
    // Get session data
    const user = await getUser()
    if (!user) return null

    const userPlan = user.plan
    if (userPlan === 'FREE') redirect('/subscription')

    // Get stripe data
    const stripeCustomerId = user.stripeCustomerId ?? undefined
    if (!stripeCustomerId) redirect('/auth')
    const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId
    })
    const userSubscription =
        subscriptions.data.length > 0 ? subscriptions.data[0] : undefined
    if (!userSubscription) redirect('/subscription')

    const susbcriptionItems = await stripe.subscriptionItems.list({
        subscription: userSubscription.id
    })

    const current_period_start = susbcriptionItems.data[0]?.current_period_start
    const current_period_end = susbcriptionItems.data[0]?.current_period_end
    const daysUntilNextPayment =
        current_period_end && current_period_start
            ? (current_period_end - current_period_start) / (3600 * 24)
            : undefined

    return (
        <div className="max-w-screen-md mx-auto pt-8">
            <h1 className="text-4xl text-center font-bold mb-12 gap-2">
                Cancel my subscription
            </h1>
            <p className="text-center">
                {daysUntilNextPayment ?? '-'} days remaining until next payment
            </p>

            <p>
                If you end your subscription now, you will still be able to
                benefit from it until
            </p>
            <span>
                {new Date(
                    (daysUntilNextPayment ?? 0) * 3600 * 24 * 1000 + Date.now()
                ).toLocaleDateString()}
            </span>

            <form>
                <Button
                    type="submit"
                    color="danger"
                    className="mx-auto"
                    formAction={async () => {
                        'use server'
                        const scheds = await stripe.subscriptionItems.list({
                            subscription: userSubscription.id
                        })
                        console.log(scheds)
                    }}
                >
                    Yes, I want to end my subscription
                </Button>
            </form>
        </div>
    )
}
