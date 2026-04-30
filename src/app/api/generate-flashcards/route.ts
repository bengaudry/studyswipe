import {serverError} from '@/lib/errorHandling/serverErrors'
import {NextRequest, NextResponse} from 'next/server'
import {getUser} from "@/lib/session";
import type {User} from "@/db/generated/prisma";
import {
    geminiFlashcardsResponseSchema,
    openaiFlashcardsResponseSchema
} from '@/lib/aiSchemas'
import {GenerateContentResponse, GoogleGenAI} from '@google/genai'
import OpenAI from 'openai'
import {zodTextFormat} from 'openai/helpers/zod'
import {z} from "zod";
import {v4 as uuidv4} from 'uuid';
import {AVAILABLE_MODELS, isUserAuthorizedToUseModel} from "@/lib/aiModels";
import {redis} from "@/lib/redis";
import {
    geminiFlashcardPromptWithDocument,
    geminiFlashcardPromptWithTopicOnly, gptFlashcardPromptWithDocument,
    gptFlashcardPromptWithTopicOnly
} from "@/lib/generationPrompts";

async function uploadDocumentToOpenAI(fileObj: File) {
    try {
        const file = await openai.files.create({
            file: fileObj,
            purpose: "user_data",
        });

        console.log("File uploaded successfully. File ID:", file.id);
        return file;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}

async function deleteFileFromOpenAI(fileId: string) {
    const deleted = await openai.files.delete(fileId);
    console.log("File deleted:", deleted.deleted);
}

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
    apiKey: process.env.OPENAI_API_KEY
})

async function hasUserEnoughCreditLeftToUseModel(user: User): Promise<boolean> {
    if ("PRO" === user.plan) return true

    // TODO : should mark pro users overusing

    try {
        const key = `studyswipe:file-upload-usage:${user.id}`
        const usage = await redis.incr(key)

        if (usage === 1) {
            await redis.expire(key, 1000 * 60 * 60 * 24 * 30) // 1 month before reset
        }

        if ("PREMIUM" === user.plan) return usage <= 20
        // if ("FREE" === user.plan)
        return usage <= 1
    } catch (e) {
        return false
    }
}

function startOpenAIStreaming(model: string, prompt: string, file: File | null): ReadableStream<string> {
    let userMessageContent: any = prompt
    let openAiFileId: string | null = null

    return new ReadableStream({
        async start(controller) {
            try {
                if (file !== null) {
                    // Convertir le fichier en base64 côté serveur
                    const buffer = await file.arrayBuffer()
                    const base64Data = Buffer.from(buffer).toString('base64')

                    const imageMimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

                    // For images, pass as image_url
                    if (imageMimeTypes.includes(file.type)) {
                        userMessageContent = [
                            {type: 'input_text', text: prompt},
                            {
                                type: 'input_image',
                                image_url: {
                                    url: `data:${file.type};base64,${base64Data}`
                                }
                            }
                        ]
                    } else {
                        const openAiFile = await uploadDocumentToOpenAI(file)
                        // For PDFs and other files, pass the base64 bytes directly
                        userMessageContent = [
                            {type: 'input_text', text: prompt},
                            {
                                type: 'input_file',
                                file_id: openAiFile.id
                            }
                        ]
                        openAiFileId = openAiFile.id
                    }
                }

                const stream = openai.responses
                    .stream({
                        model,
                        input: [
                            {
                                role: 'system',
                                content: file === null ? gptFlashcardPromptWithTopicOnly : gptFlashcardPromptWithDocument
                            },
                            {role: 'user', content: userMessageContent},
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
                        controller.error(event.delta)
                    })
                    .on('response.output_text.delta', (event) => {
                        controller.enqueue(event.delta)
                    })
                    .on('response.failed', (event) => {
                        controller.error(event.response)
                    })

                await stream.done()
                controller.close()
            } catch (error) {
                controller.error(error)
            } finally {
                if (openAiFileId !== null) {
                    await deleteFileFromOpenAI(openAiFileId)
                }
            }
        }
    })
}

function startGeminiStreaming(model: string, prompt: string, file: File | null): ReadableStream<string> {
    return new ReadableStream({
        async start(controller) {
            try {
                const ai = new GoogleGenAI({
                    apiKey: process.env.GOOGLE_AI_API_KEY
                })

                let stream: AsyncGenerator<GenerateContentResponse, any, any>
                if (file !== null) {
                    const contents = [
                        {text: prompt},
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
                            systemInstruction: geminiFlashcardPromptWithDocument,
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
                            systemInstruction: geminiFlashcardPromptWithTopicOnly,
                            responseMimeType: 'application/json',
                            responseSchema: geminiFlashcardsResponseSchema
                        }
                    })
                }

                for await (const chunk of stream) {
                    console.log(chunk)
                    const candidates = chunk.candidates
                    const parts = candidates
                        ? candidates[0].content?.parts
                        : undefined
                    const data = parts ? parts[0].text : undefined
                    if (data) controller.enqueue(data)
                }

                controller.close()
            } catch (error) {
                controller.error(error)
            }
        }
    })
}

async function* startStreamingAIResponse(
    model: string,
    prompt: string,
    file: File | null
): AsyncGenerator<FlashCard> {
    const parser = new AiResultFormatter()

    // Sélectionner le stream approprié en fonction du modèle
    let aiStream: ReadableStream<string> | null = null
    if (model.includes("gemini")) {
        aiStream = startGeminiStreaming(model, prompt, file)
    } else if (model.includes("gpt")) {
        aiStream = startOpenAIStreaming(model, prompt, file)
    }

    if (!aiStream) {
        throw new Error(`Invalid model: ${model}`)
    }

    // Lire le stream et parser les chunks
    const reader = aiStream.getReader()

    try {
        while (true) {
            const {done, value} = await reader.read()
            if (done) break

            // value est déjà une string, pas besoin de décoder
            const card = parser.updateBuffer(value)

            // Yield chaque carte complète dès qu'elle est parsée
            if (card) {
                yield card
            }
        }
    } finally {
        reader.releaseLock()
    }
}


const payloadSchema = z.object({
    prompt: z.string({
        required_error: "Prompt is required",
        invalid_type_error: "Prompt must be a string"
    }),
    model: z.string({
        required_error: "Model is required",
        invalid_type_error: "Model must be a string"
    }).min(1, "Model cannot be empty"),
    file: z.object({
        data: z.string({
            required_error: "File data is required",
            invalid_type_error: "File data must be a string (base64)"
        }),
        type: z.string(),
        name: z.string()
    }).nullable().optional()
})

export async function POST(req: NextRequest) {
    const params = req.nextUrl.searchParams

    const deckId = params.get('deck-id')
    if (!deckId) return serverError('missing-parameters', 'Parameter missing: <deck-id>')
    try {
        const payload = payloadSchema.parse(await req.json())
        const {prompt, model} = payload

        // Convertir le fichier base64 en File
        let file: File | null = null
        if (payload.file) {
            const buffer = Buffer.from(payload.file.data, 'base64')
            file = new File([buffer], payload.file.name, {type: payload.file.type})

            // Vérifier la taille
            if (file.size > 10 * 1024 * 1024) {
                return serverError('invalid-payload', 'File size must be less than 10MB')
            }
        }

        if (!AVAILABLE_MODELS.includes(model)) {
            return serverError(
                'invalid-payload',
                'Parameter <model> must be one of : ' + AVAILABLE_MODELS.join(', ')
            )
        }

        const user = await getUser()
        if (!user) {
            return serverError('unauthenticated')
        }

        if (!isUserAuthorizedToUseModel(model, user)) {
            return serverError('unauthorized', 'Your current plan does not allow you to use this model')
        }

        if (!(await hasUserEnoughCreditLeftToUseModel(user))) {
            return serverError('unauthorized', 'You do not have enough credit left to use this model')
        }

        const encoder = new TextEncoder()
        return new NextResponse(new ReadableStream({
            async start(controller) {
                try {
                    controller.enqueue(encoder.encode(JSON.stringify({ type: "ping", data: "Uploading document..." }) + '\n'))
                    for await (const card of startStreamingAIResponse(model, prompt, file)) {
                        const msg = {
                            type: "card",
                            data: card
                        }
                        controller.enqueue(encoder.encode(JSON.stringify(msg) + '\n'))
                    }
                    controller.close()
                } catch (error) {
                    controller.error(error)
                }
            }
        }), {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked'
            }
        })
    } catch (e) {
        if (e instanceof z.ZodError) {
            return serverError('invalid-payload', e.errors.map((err) => err.message).join('; '))
        }
        return serverError('invalid-payload', 'An unknown error occurred while validating the payload')
    }
}
