'use client'
import { useRouter } from 'next/navigation'
import { Button } from '../../ui'
import { ArrowRight } from 'react-feather'

export function LandingCta() {
    const { push } = useRouter()
    return (
        <Button
            size="lg"
            onPress={() => push('/collections')}
            className="z-20 mt-6 w-fit mx-auto"
            color="primary"
            endContent={<ArrowRight />}
        >
            Create a flashcard
        </Button>
    )
}
