'use client'

import {Check, X} from 'react-feather'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Button, Card, CardBody, Chip, Switch, Accordion, AccordionItem} from '@/components/ui'

type BillingPeriod = 'monthly' | 'annual'

interface Plan {
    id: string
    name: string
    subtitle: string
    price: { monthly: number; annual: number }
    priceId: { monthly: string; annual: string }
    description: string
    features: Array<{ name: string; included: boolean }>
    highlighted: boolean
    badge?: string
}

const PricingCard = ({
                         plan,
                         userPlan,
                         billingPeriod,
                         onSelect,
                     }: {
    plan: Plan
    userPlan: string
    billingPeriod: BillingPeriod
    onSelect: (plan: Plan, period: BillingPeriod) => void
}) => {
    const isCurrentPlan = userPlan === plan.id.toUpperCase()
    const price = plan.price[billingPeriod]
    const annualSavings = billingPeriod === 'annual' ? Math.round(plan.price.monthly * 12 - plan.price.annual) : 0

    return (
        <div className="relative">
            {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <Chip
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold"
                        size="sm"
                        variant="flat"
                    >
                        {plan.badge}
                    </Chip>
                </div>
            )}
            <Card
                className={`relative flex flex-col h-full transition-all duration-300 ${
                    plan.highlighted
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-500 shadow-2xl'
                        : 'shadow-lg hover:shadow-xl'
                }`}
                isBlurred
            >

                <CardBody className="p-8 flex flex-col gap-0">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                            {plan.name}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                            {plan.subtitle}
                        </p>
                        <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                            {price === 0 ? 'Gratuit' : `${price.toFixed(2)}€`}
                        </span>
                            {price > 0 && (
                                <span className="text-neutral-500 dark:text-neutral-400">
                                /{billingPeriod === 'monthly' ? 'mois' : 'an'}
                            </span>
                            )}
                        </div>
                        {annualSavings > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                                Économisez {annualSavings}€ à l'année
                            </p>
                        )}
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-3">
                            {plan.description}
                        </p>
                    </div>

                    <Button
                        onPress={() => onSelect(plan, billingPeriod)}
                        color={isCurrentPlan ? 'default' : plan.highlighted ? 'primary' : 'default'}
                        className={`w-full font-semibold mb-8 ${
                            isCurrentPlan ? 'cursor-default opacity-50' : ''
                        } ${
                            plan.highlighted && !isCurrentPlan
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg'
                                : ''
                        }`}
                        disabled={isCurrentPlan}
                        size="lg"
                        variant={isCurrentPlan ? 'flat' : plan.highlighted ? 'solid' : 'bordered'}
                    >
                        {isCurrentPlan
                            ? 'Votre plan actuel'
                            : plan.id === 'starter'
                                ? 'Commencer gratuitement'
                                : 'Choisir ce plan'}
                    </Button>

                    <div className="space-y-3 flex-1">
                        {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                {feature.included ? (
                                    <Check
                                        size={20}
                                        className="text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5"
                                    />
                                ) : (
                                    <X
                                        size={20}
                                        className="text-neutral-300 dark:text-neutral-600 flex-shrink-0 mt-0.5"
                                    />
                                )}
                                <span
                                    className={`text-sm ${
                                        feature.included
                                            ? 'text-neutral-700 dark:text-neutral-200'
                                            : 'text-neutral-400 dark:text-neutral-500 line-through'
                                    }`}
                                >
                                {feature.name}
                            </span>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}


export default function PricingPageClientComponent({
                                                       initialUserPlan,
                                                       plans,
                                                       faqs,
                                                   }: {
    initialUserPlan: string
    plans: Plan[]
    faqs: Array<{ question: string; answer: string }>
}) {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
    const router = useRouter()

    const handleSelectPlan = async (plan: Plan, period: BillingPeriod) => {
        if (plan.id === 'starter') {
            router.push('/cancelsubscription')
            return
        }

        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: plan.priceId[period],
                }),
            })

            if (!response.ok) {
                console.error('Failed to create checkout session')
                return
            }

            const {url} = await response.json()
            if (url) {
                router.push(url)
            }
        } catch (error) {
            console.error('Error creating checkout session:', error)
        }
    }

    return (
        <div className="">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 dark:text-white mb-4">
                        Boostez votre mémoire avec l'IA
                    </h1>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
                        Choisissez le plan parfait pour votre apprentissage
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex justify-center items-center gap-4 mb-12 flex-wrap">
                        <span
                            className={`text-lg font-semibold ${
                                billingPeriod === 'monthly'
                                    ? 'text-neutral-900 dark:text-white'
                                    : 'text-neutral-500'
                            }`}
                        >
                            Mensuel
                        </span>
                        <Switch
                            isSelected={billingPeriod === 'annual'}
                            onValueChange={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                            size="lg"
                        />
                        <span
                            className={`text-lg font-semibold ${
                                billingPeriod === 'annual'
                                    ? 'text-neutral-900 dark:text-white'
                                    : 'text-neutral-500'
                            }`}
                        >
                            Annuel
                        </span>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {plans.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            userPlan={initialUserPlan}
                            billingPeriod={billingPeriod}
                            onSelect={handleSelectPlan}
                        />
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-8">
                        Questions fréquentes
                    </h2>
                    <Card isBlurred>
                        <CardBody>
                            <Accordion>
                                {faqs.map((faq, idx) => (
                                    <AccordionItem
                                        key={idx}
                                        aria-label={faq.question}
                                        title={<span className="font-semibold text-lg">{faq.question}</span>}
                                    >
                                        <p className="text-neutral-600 dark:text-neutral-400">
                                            {faq.answer}
                                        </p>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardBody>
                    </Card>
                </div>

                {/* Footer CTA */}
                <div className="text-center mt-12">
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Pas sûr du plan à choisir ?
                    </p>
                    <a
                        href="mailto:support@studyswipe.com"
                        className="text-primary underline"
                    >
                        Contactez notre équipe de support
                    </a>
                </div>
            </div>
        </div>
    )
}


