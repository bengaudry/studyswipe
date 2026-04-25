import { serverError, serverOk } from '@/lib/errorHandling/serverErrors'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { validateFlashCardArray } from '@/lib/cardObject'
import { v4 as uuidv4 } from 'uuid'
import { getUser } from '@/lib/session'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        if (!body || typeof body !== 'object' || !body.data || !body.deckId)
            return serverError(
                'invalid-payload',
                'Missing properties: <data> <deckId>'
            )

        const deck = await prisma.deck.findUnique({
            where: { id: body.deckId }
        })

        if (deck === null) return serverError('invalid-deckid')

        const user = await getUser()
        if (!user || user?.id !== deck.ownerId)
            return serverError('unauthorized')

        const res = validateFlashCardArray(body.data)
        if (typeof res === 'string') return serverError('invalid-payload', res)

        const resWithIds = res.map((card) =>
            typeof card.id === 'string' ? card : { ...card, id: uuidv4() }
        )

        const newCards: FlashCard[] = Array.prototype.concat(
            deck.cards as FlashCard[],
            resWithIds
        )

        await prisma.deck.update({
            where: { id: deck.id },
            data: { cards: newCards }
        })

        return serverOk()
    } catch (error) {
        return serverError('internal-server-error', error)
    }
}
