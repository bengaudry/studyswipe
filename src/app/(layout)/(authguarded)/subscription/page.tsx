import { getUser } from '@/lib/session'
import PricingPageClientComponent from './pricing-client'

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

const plans: Plan[] = [
    {
        id: 'starter',
        name: 'Starter',
        subtitle: 'Pour découvrir',
        price: { monthly: 0, annual: 0 },
        priceId: { monthly: '', annual: '' },
        description: 'Commencez votre parcours de révision',
        features: [
            { name: 'Création manuelle illimitée', included: true },
            { name: '5 générations IA/mois (Gemini Flash)', included: true },
            { name: 'Import 1 PDF (max 2Mo)', included: true },
            { name: 'Collections illimitées', included: false },
            { name: 'Algorithme SRS avancé', included: false },
            { name: 'Support prioritaire', included: false },
        ],
        highlighted: false,
    },
    {
        id: 'premium',
        name: 'Premium',
        subtitle: 'Pour étudiants réguliers',
        price: { monthly: 5.99, annual: 59.90 },
        priceId: {
            monthly: 'price_1RP5idQ6RlBHGHPYTTeUVAik',
            annual: 'price_annual_boost',
        },
        description: 'Le plus populaire pour une étude efficace',
        features: [
            { name: '100 générations IA/mois', included: true },
            { name: 'Accès GPT-4o Mini & Gemini Flash', included: true },
            { name: 'Import 20 PDF/mois', included: true },
            { name: 'Algorithme SRS optimisé', included: true },
            { name: 'Collections illimitées', included: true },
            { name: 'Support prioritaire', included: false },
        ],
        highlighted: true,
        badge: 'Populaire',
    },
    {
        id: 'pro',
        name: 'Pro',
        subtitle: 'Pour la performance',
        price: { monthly: 12.99, annual: 129.90 },
        priceId: {
            monthly: 'price_pro_monthly',
            annual: 'price_pro_annual',
        },
        description: 'Performance maximale et analyse avancée',
        features: [
            { name: 'Générations IA illimitées', included: true },
            { name: 'Accès GPT-4o & Gemini Pro', included: true },
            { name: 'Analyse documents complexes (50Mo/doc)', included: true },
            { name: 'Algorithme SRS avancé', included: true },
            { name: 'Statistiques d\'apprentissage détaillées', included: true },
            { name: 'Support prioritaire 24/7', included: true },
        ],
        highlighted: false,
    },
]

const faqs = [
    {
        question: 'Puis-je annuler mon abonnement à tout moment ?',
        answer: 'Oui, bien sûr ! Vous pouvez annuler votre abonnement à tout moment sans frais supplémentaires. Votre accès reste actif jusqu\'à la fin de la période de facturation.',
    },
    {
        question: 'Quels modèles d\'IA utilisez-vous ?',
        answer: 'Nous utilisons les meilleurs modèles disponibles : GPT-4o & GPT-4o Mini d\'OpenAI, ainsi que Gemini Flash et Gemini Pro de Google AI.',
    },
    {
        question: 'Puis-je changer mon plan en cours de route ?',
        answer: 'Absolument ! Vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements prendront effet lors de votre prochain cycle de facturation.',
    },
    {
        question: 'Offrez-vous une période d\'essai gratuite ?',
        answer: 'Le plan Starter est gratuit et sans limite de durée. Vous pouvez l\'utiliser gratuitement pour tester toutes les fonctionnalités de base.',
    },
]

async function PricingPage() {
    const user = await getUser()
    const userPlan = user?.plan ?? 'FREE'

    return (
        <PricingPageClientComponent
            initialUserPlan={userPlan}
            plans={plans}
            faqs={faqs}
        />
    )
}

export default PricingPage

