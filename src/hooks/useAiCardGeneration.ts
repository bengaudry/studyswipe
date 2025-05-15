import { geminiFlashcardsResponseSchema } from "@/lib/googleAi";
import { GoogleGenAI } from "@google/genai";
import { useState } from "react";

export function useAiCardGeneration() {
  const [data, setData] = useState<FlashCard[] | null>(null);
  const [isAskingGeneration, setIsAskingGeneration] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCards = async (
    prompt: string,
    deckid: string,
    onUpdate: (generatedCard: FlashCard) => void,
    onStartGeneration: () => void
  ) => {
    try {
      setIsAskingGeneration(true);
      // Avoid calling the ai if the input is not good enough
      if (prompt === undefined || prompt === null || prompt === "") return;
      if (typeof prompt !== "string") return;
      if (prompt.length < 3) return;

      const ai = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
      });

      // Stream generated data
      const stream = await ai.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "Generate a collection of flashcards about the topic that is given to you. The questions and answers must follow the language used in the topic. Keep questions and answers as concise as possible. Try to split all your knowledge into multiple cards, instead of putting everything on one card. Avoid using special characters such as * if it is not needed for comprehension. Make sentences as short as possible, while keeping important information. If the answer is a bit short, try adding a short and concise example.",
          responseMimeType: "application/json",
          responseSchema: geminiFlashcardsResponseSchema,
        },
      });

      setIsAskingGeneration(false);

      onStartGeneration();
      setIsGenerating(true);
      let buffer = "";
      const generatedCards: FlashCard[] = [];

      for await (const chunk of stream) {
        console.log(chunk);
        const candidates = chunk.candidates;
        const parts = candidates ? candidates[0].content?.parts : undefined;
        const data = parts ? parts[0].text : undefined;

        if (!data) continue;

        buffer += data;

        // Strip initial buffer characters
        const startingIndex = buffer.indexOf("{");
        if (startingIndex === -1) continue;
        buffer = buffer.trim().slice(startingIndex); // Remove the opening characters ('[' + spaces and newlines)

        // Skip verification process if one of the two mandatory
        // fields is missing
        let questionFieldFound = buffer.includes('"question"');
        let answerFieldFound = buffer.includes('"answer"');
        if (!questionFieldFound || !answerFieldFound) continue;

        // Analyze buffer to extract a correct object
        let openingCurlyBracketsCount = 0;
        let closingCurlyBracketsCount = 0;
        let openingSquareBracketsCount = 0;
        let closingSquareBracketsCount = 0;
        let isInString = false;
        let charIdx = -1;
        for (const char of buffer) {
          // Increment counters
          charIdx++;
          if (char === "{" && !isInString) openingCurlyBracketsCount++;
          if (char === "}" && !isInString) closingCurlyBracketsCount++;
          if (char === "[" && !isInString) openingSquareBracketsCount++;
          if (char === "]" && !isInString) closingSquareBracketsCount++;
          if (char === '"') isInString = !isInString;

          // If the object is malformed, continue generating
          if (openingCurlyBracketsCount === 0) continue;
          if (closingCurlyBracketsCount === 0) continue;
          if (openingSquareBracketsCount === 0) continue;
          if (closingSquareBracketsCount === 0) continue;

          // If one object has been found
          if (
            openingCurlyBracketsCount === closingCurlyBracketsCount &&
            openingSquareBracketsCount === closingSquareBracketsCount
          ) {
            // Get the object
            const strObj = buffer.slice(startingIndex, charIdx + 1);

            // Remove the object from the buffer
            buffer = buffer.slice(charIdx + 1);
            try {
              const obj = JSON.parse(strObj);
              generatedCards.push(obj);
              setData((prev) => (prev ? [...prev, obj] : [obj]));
              onUpdate(obj);
            } catch (e) {
              console.warn(e);
            }
            break;
          }
        }
      }

      // Upload cards onto the server
      await fetch(`/api/fill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deckId: deckid,
          data: generatedCards,
        }),
      });
    } catch (err) {
      console.error("Error in data provided :");
      console.error(err);
      setData(null);
    } finally {
      setIsGenerating(false);
      setIsAskingGeneration(false);
    }
  };

  return {
    data,
    isAskingGeneration,
    isGenerating,
    generateCards,
  };
}
