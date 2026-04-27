import {
    geminiFlashcardsResponseSchema,
    openaiFlashcardsResponseSchema
} from '@/lib/aiSchemas'
import { GenerateContentResponse, GoogleGenAI } from '@google/genai'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'

class AiResultFormatter {
    buffer: string
    generatedCards: FlashCard[]

    constructor() {
        this.buffer = ''
        this.generatedCards = []
    }

    updateBuffer(chunk: string | undefined | null): FlashCard | null {
        if (!chunk) return null
        this.buffer += chunk

        if (this.buffer.startsWith('{"cards":')) {
            this.buffer = this.buffer.replace('{"cards":', '')
        }

        // Strip initial buffer characters
        const startingIndex = this.buffer.indexOf('{')
        if (startingIndex === -1) return null
        this.buffer = this.buffer.trim().slice(startingIndex) // Remove the opening characters ('[' + spaces and newlines)

        // Skip verification process if one of the two mandatory
        // fields is missing
        let questionFieldFound = this.buffer.includes('"question"')
        let answerFieldFound = this.buffer.includes('"answer"')
        if (!questionFieldFound || !answerFieldFound) return null

        // Analyze buffer to extract a correct object
        let openingCurlyBracketsCount = 0
        let closingCurlyBracketsCount = 0
        let openingSquareBracketsCount = 0
        let closingSquareBracketsCount = 0
        let isInString = false
        let charIdx = -1

        for (const char of this.buffer) {
            // Increment counters
            charIdx++
            if (char === '{' && !isInString) openingCurlyBracketsCount++
            if (char === '}' && !isInString) closingCurlyBracketsCount++
            if (char === '[' && !isInString) openingSquareBracketsCount++
            if (char === ']' && !isInString) closingSquareBracketsCount++
            if (char === '"') isInString = !isInString

            // If the object is not formed yet, continue searching
            if (openingCurlyBracketsCount === 0) continue
            if (closingCurlyBracketsCount === 0) continue
            if (openingSquareBracketsCount === 0) continue
            if (closingSquareBracketsCount === 0) continue

            if (
                openingCurlyBracketsCount !== closingCurlyBracketsCount ||
                openingSquareBracketsCount !== closingSquareBracketsCount
            ) {
                continue
            }

            // Get the object
            const strObj = this.buffer.slice(startingIndex, charIdx + 1)

            // Remove the object from the buffer
            this.buffer = this.buffer.slice(charIdx + 1)
            try {
                const obj = JSON.parse(strObj) as FlashCard

                const convertAiTextToLaTeX = (
                    element: FlashCardContentJSON
                ): FlashCardContentJSON => {
                    if (element.type !== 'text') return element
                    if (
                        element.text.includes('\\(') &&
                        element.text.includes('\\)')
                    ) {
                        const LaTeXformatted = element.text
                            .replaceAll('\\(', '$')
                            .replaceAll('\\)', '$')
                        const newElement: FlashCardContentJSON = {
                            type: 'equation',
                            equation: `$${LaTeXformatted}$`
                        }
                        return newElement
                    }
                    if (element.text.match('.*$[^$]+$.*')) {
                        const newElement: FlashCardContentJSON = {
                            type: 'equation',
                            equation: element.text
                        }
                        return newElement
                    }
                    return element
                }

                obj.id = uuidv4()
                obj.aiGenerated = true
                obj.question = obj.question.map(convertAiTextToLaTeX)
                obj.answer = obj.answer.map(convertAiTextToLaTeX)

                this.generatedCards.push(obj)
                return obj
            } catch (e) {
                console.warn(e)
            }
        }
        return null
    }
}

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
})

export function useAiCardGeneration() {
    const [data, setData] = useState<FlashCard[] | null>(null)
    const [isAskingGeneration, setIsAskingGeneration] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const generateCards = async (
        prompt: string,
        file: File | null,
        deckid: string,
        model: 'gemini-2.0-flash' | 'gemini-3.1-pro-preview' | 'gpt-4o',
        onUpdate: (generatedCard: FlashCard) => void,
        onStartGeneration?: () => void
    ) => {
        const parser = new AiResultFormatter()

        try {
            setIsAskingGeneration(true)
            // Avoid calling the AI if the input is not good enough
            if (
                file === null &&
                (prompt === undefined || prompt === null || prompt === '')
            )
                return
            if (typeof prompt !== 'string') return
            if (file === null && prompt.length < 3) return

            const generatedCards: FlashCard[] = []

            setIsAskingGeneration(true)

            if (
                'gemini-2.0-flash' === model ||
                'gemini-3.1-pro-preview' === model
            ) {
                const ai = new GoogleGenAI({
                    apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY
                })

                let stream: AsyncGenerator<GenerateContentResponse, any, any>
                if (file !== null) {
                    const contents = [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: 'application/pdf',
                                data: Buffer.from(
                                    await file.arrayBuffer()
                                ).toString('base64')
                            }
                        }
                    ]

                    stream = await ai.models.generateContentStream({
                        model,
                        contents,
                        config: {
                            maxOutputTokens: 7500,
                            systemInstruction: `Create a set of flashcards based on the analysis of the document. Ensure that both questions and answers are in the same language as the document. Keep the questions and answers brief and to the point. Distribute the information across multiple cards rather than consolidating it onto a single card. Avoid unnecessary special characters like * unless they are essential for understanding. Keep sentences short while retaining key information. If an answer is brief, consider adding a concise example. For mathematical content, it is mandatory to use LaTeX format for equations. When creating flashcards, ensure that LaTeX equations are formatted correctly within the structure. Use the "equation" type to encapsulate LaTeX equations. Here is an example of how to structure a LaTeX equation in the flashcard: {{"question": [{"type": "text","heading": "paragraph","text": "What is the formula for the area of a circle?"}],"answer": [{"type": "text", "heading": "paragraph", "text": "The area of a circle is defined by :"},{"type": "equation",equation": "A = \\pi r^2"}]}`,
                            responseMimeType: 'application/json',
                            responseSchema: geminiFlashcardsResponseSchema
                        }
                    })
                } else {
                    // Stream generated data
                    stream = await ai.models.generateContentStream({
                        model,
                        contents: prompt,
                        config: {
                            systemInstruction:
                                'Generate a collection of flashcards about the topic that is given to you. The questions and answers must follow the language used in the topic. Keep questions and answers as concise as possible. Try to split all your knowledge into multiple cards, instead of putting everything on one card. Avoid using special characters such as * if it is not needed for comprehension. Make sentences as short as possible, while keeping important information. If the answer is a bit short, try adding a short and concise example. For math content, you HAVE TO use the equation component in LaTeX format.',
                            responseMimeType: 'application/json',
                            responseSchema: geminiFlashcardsResponseSchema
                        }
                    })
                }

                setIsAskingGeneration(false)
                if (onStartGeneration) onStartGeneration()
                setIsGenerating(true)

                for await (const chunk of stream) {
                    console.log(chunk)
                    const candidates = chunk.candidates
                    const parts = candidates
                        ? candidates[0].content?.parts
                        : undefined
                    const data = parts ? parts[0].text : undefined

                    const obj = parser.updateBuffer(data)
                    if (obj !== null) {
                        setData((prev) => (prev ? [...prev, obj] : [obj]))
                        onUpdate(obj)
                        generatedCards.push(obj)
                    }
                }
            }

            if ('gpt-4o' === model) {
                let hasGenerationStarted = false
                const stream = openai.responses
                    .stream({
                        model: 'gpt-4o',
                        input: [
                            {
                                role: 'system',
                                content:
                                    'Generate a collection of flashcards about the topic that is given to you. The questions and answers must follow the language used in the topic. Keep questions and answers as concise as possible. Try to split all your knowledge into multiple cards, instead of putting everything on one card. Avoid using special characters such as * if it is not needed for comprehension. Make sentences as short as possible, while keeping important information. If the answer is a bit short, try adding a short and concise example. For math content, you HAVE TO use the equation component in LaTeX format.'
                            },
                            { role: 'user', content: prompt }
                        ],
                        text: {
                            format: zodTextFormat(
                                openaiFlashcardsResponseSchema,
                                'flashcards_schema'
                            )
                        }
                    })
                    .on('response.refusal.delta', (event) => {
                        console.warn('response.refusal.delta')
                        throw event.delta
                    })
                    .on('response.output_text.delta', (event) => {
                        if (!hasGenerationStarted) {
                            setIsAskingGeneration(false)
                            if (onStartGeneration) onStartGeneration()
                            setIsGenerating(true)
                            hasGenerationStarted = true
                        }
                        const obj = parser.updateBuffer(event.delta)
                        if (obj !== null) {
                            setData((prev) => (prev ? [...prev, obj] : [obj]))
                            onUpdate(obj)
                            generatedCards.push(obj)
                        }
                    })
                    .on('response.failed', (event) => {
                        throw event.response
                    })

                await stream.done()
            }

            console.info('generatedCards')
            console.log(generatedCards)

            setIsGenerating(false)
            setIsAskingGeneration(false)

            // Upload cards onto the server
            await fetch(`/api/fill`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deckId: deckid,
                    data: generatedCards
                })
            })
        } catch (err) {
            console.error('Error in data provided :')
            console.error(err)
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
