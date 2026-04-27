import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DeckPageHeader } from '@/components/pages/deck/DeckPageHeader'
import { DeckPageBody } from '@/components/pages/deck/DeckPageBody'
import { DeckDataProvider } from '@/components/pages/deck/DeckDataProvider'
import { getUser } from '@/lib/session'

export default async function DeckPage({
    params
}: {
    params: Promise<{ deckid: string }>
}) {
    const user = await getUser()
    if (!user) redirect('/')

    const deck = await prisma.deck.findUnique({
        where: { id: (await params).deckid }
    })
    if (deck === null) redirect('/')

    return (
        <DeckDataProvider initialDeckState={deck}>
            <DeckPageHeader deck={deck} />

            <DeckPageBody
                deck={deck}
            />
        </DeckDataProvider>
    )
}
