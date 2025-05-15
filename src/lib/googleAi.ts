import { Schema, Type } from "@google/genai";

export const geminiFlashcardsResponseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.ARRAY,
        maxItems: "5",
        minItems: "1",
        items: {
          anyOf: [
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["text"],
                },
                heading: {
                  type: Type.STRING,
                  enum: ["title", "subtitle", "paragraph"],
                },
                text: {
                  type: Type.STRING,
                },
              },
              required: ["type", "heading", "text"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["image"],
                },
                alt: {
                  type: Type.STRING,
                },
                imgUri: {
                  type: Type.STRING,
                },
                width: {
                  type: Type.INTEGER,
                },
                height: {
                  type: Type.INTEGER,
                },
              },
              required: ["type", "alt", "imgUri"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["equation"],
                },
                equation: {
                  type: Type.STRING,
                },
              },
              required: ["type", "equation"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["quote"],
                },
                content: {
                  type: Type.STRING,
                },
                author: {
                  type: Type.STRING,
                },
                year: {
                  type: Type.INTEGER,
                },
              },
              required: ["type", "content"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["link"],
                },
                href: {
                  type: Type.STRING,
                },
              },
              required: ["type", "href"],
            },
          ],
        },
      },
      answer: {
        type: Type.ARRAY,
        maxItems: "3",
        minItems: "1",
        items: {
          anyOf: [
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["text"],
                },
                heading: {
                  type: Type.STRING,
                  enum: ["title", "subtitle", "paragraph"],
                },
                text: {
                  type: Type.STRING,
                },
              },
              required: ["type", "heading", "text"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["image"],
                },
                alt: {
                  type: Type.STRING,
                },
                imgUri: {
                  type: Type.STRING,
                },
                width: {
                  type: Type.INTEGER,
                },
                height: {
                  type: Type.INTEGER,
                },
              },
              required: ["type", "alt", "imgUri"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["equation"],
                },
                equation: {
                  type: Type.STRING,
                },
              },
              required: ["type", "equation"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["quote"],
                },
                content: {
                  type: Type.STRING,
                },
                author: {
                  type: Type.STRING,
                },
                year: {
                  type: Type.INTEGER,
                },
              },
              required: ["type", "content"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["link"],
                },
                href: {
                  type: Type.STRING,
                },
              },
              required: ["type", "href"],
            },
          ],
        },
      },
    },
    required: ["question", "answer"],
  },
};