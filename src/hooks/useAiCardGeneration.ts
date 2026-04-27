import { useState } from 'react'

export function useAiCardGeneration() {
    const [data, setData] = useState<FlashCard[] | null>(null)
    const [isAskingGeneration, setIsAskingGeneration] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const generateCards = async (
        prompt: string,
        file: File | null,
        deckid: string,
        model: 'gemini-2.0-flash' | 'gemini-3.1-pro-preview' | 'gpt-4o' | 'gpt-4o-mini',
        onUpdate: (generatedCard: FlashCard) => void,
        onStartGeneration?: () => void
    ) => {
        try {
            setIsAskingGeneration(true)

            // Validation basique
            if (
                file === null &&
                (prompt === undefined || prompt === null || prompt === '')
            )
                return
            if (file === null && prompt.length < 3) return

            // Construire le body JSON
            let fileBase64: string | null = null
            if (file) {
                fileBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                        const result = reader.result as string
                        resolve(result.split(',')[1])
                    }
                    reader.readAsDataURL(file)
                })
            }

            // Appeler l'API avec JSON
            const response = await fetch(
                `/api/generate-flashcards?deck-id=${deckid}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt,
                        model,
                        file: file && fileBase64 ? {
                            data: fileBase64,
                            type: file.type,
                            name: file.name
                        } : null
                    })
                }
            )

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}, ${await response.text()}`)
            }

            setIsAskingGeneration(false)
            if (onStartGeneration) onStartGeneration()
            setIsGenerating(true)

            // Parser le stream en JSON Lines
            if (!response.body) {
                throw new Error('No response body')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            const generatedCards: FlashCard[] = []

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                // Décoder le chunk
                buffer += decoder.decode(value, { stream: true })

                // Parser les lignes JSON complètes
                const lines = buffer.split('\n')
                buffer = lines.pop() || '' // Garder la dernière ligne incomplète

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const card = JSON.parse(line) as FlashCard
                            setData((prev) => (prev ? [...prev, card] : [card]))
                            onUpdate(card)
                            generatedCards.push(card)
                        } catch (e) {
                            console.warn('Failed to parse card:', e)
                        }
                    }
                }
            }

            console.info('generatedCards', generatedCards)
            setIsGenerating(false)
            setIsAskingGeneration(false)
        } catch (err) {
            console.error('Error generating cards:', err)
            setData(null)
        } finally {
            setIsGenerating(false)
            setIsAskingGeneration(false)
        }
    }

    return {
        data,
        isAskingGeneration,
        isGenerating,
        generateCards
    }
}
