import { Schema, Type } from '@google/genai'
import { z } from 'zod'

// Define the schema for each type in the union
const textSchema = z.object({
    type: z.literal('text'),
    heading: z.enum(['title', 'subtitle', 'paragraph']),
    text: z.string()
})

const imageSchema = z.object({
    type: z.literal('image'),
    alt: z.string(),
    imgUri: z.string(),
    width: z.number().nullable(),
    height: z.number().nullable()
})

const equationSchema = z.object({
    type: z.literal('equation'),
    equation: z.string()
})

const quoteSchema = z.object({
    type: z.literal('quote'),
    content: z.string(),
    author: z.string().nullable(),
    year: z.number().nullable()
})

const linkSchema = z.object({
    type: z.literal('link'),
    href: z.string()
})

// Combine the schemas into a union type
const flashCardContentJSONSchema = z.discriminatedUnion('type', [
    textSchema,
    imageSchema,
    equationSchema,
    quoteSchema,
    linkSchema
])

const flashcardSchema = z.object({
    question: z.array(flashCardContentJSONSchema),
    answer: z.array(flashCardContentJSONSchema)
})

export const openaiFlashcardsResponseSchema = z.object({
    cards: z.array(flashcardSchema)
})

export const geminiFlashcardsResponseSchema: Schema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: {
                type: Type.ARRAY,
                maxItems: '5',
                minItems: '1',
                items: {
                    anyOf: [
                        {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: ['text']
                                },
                                heading: {
                                    type: Type.STRING,
                                    enum: ['title', 'subtitle', 'paragraph']
                                },
                                text: {
                                    type: Type.STRING
                                }
                            },
                            required: ['type', 'heading', 'text']
                        },
                        {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: ['image']
                                },
                                alt: {
                                    type: Type.STRING
                                },
                                imgUri: {
                                    type: Type.STRING
                                },
                                width: {
                                    type: Type.INTEGER
                                },
                                height: {
                                    type: Type.INTEGER
                                }
                            },
                            required: ['type', 'alt', 'imgUri']
                        },
                        {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: ['equation']
                                },
                                equation: {
                                    type: Type.STRING
                                }
                            },
                            required: ['type', 'equation']
                        },
                        {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: ['quote']
                                },
                                content: {
                                    type: Type.STRING
                                },
                                author: {
                                    type: Type.STRING
                                },
                                year: {
                                    type: Type.INTEGER
                                }
                            },
                            required: ['type', 'content']
                        },
                        {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: ['link']
                                },
                                href: {
                                    type: Type.STRING
                                }
                            },
                            required: ['type', 'href']
                        }
                    ]
                }
            },
            answer: {
                type: Type.ARRAY,
                maxItems: '3',
                minItems: '1',
                items: {
                    anyOf: [
                        {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: ['text']
                                },
                                heading: {
                                    type: Type.STRING,
                                    enum: ['title', 'subtitle', 'paragraph']
                                },
                                text: {
                                    type: Type.STRING
                                }
                            },
                            required: ['type', 'heading', 'text']
                        },
                        {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: ['image']
                                },
                                alt: {
                                    type: Type.STRING
                                },
                                imgUri: {
                                    type: Type.STRING
                                },
                                width: {
                                    type: Type.INTEGER
                                },
                                height: {
                                    type: Type.INTEGER
                                }
                            },
                            required: ['type', 'alt', 'imgUri']
                        },
                        {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: ['equation']
                                },
                                equation: {
                                    type: Type.STRING
                                }
                            },
                            required: ['type', 'equation']
                        },
                        {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: ['quote']
                                },
                                content: {
                                    type: Type.STRING
                                },
                                author: {
                                    type: Type.STRING
                                },
                                year: {
                                    type: Type.INTEGER
                                }
                            },
                            required: ['type', 'content']
                        },
                        {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: ['link']
                                },
                                href: {
                                    type: Type.STRING
                                }
                            },
                            required: ['type', 'href']
                        }
                    ]
                }
            }
        },
        required: ['question', 'answer']
    }
}
