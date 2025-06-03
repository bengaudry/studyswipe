import { serverError } from "@/lib/errorHandling/serverErrors";
import { NextRequest } from "next/server";
import OpenAI from "openai";

class AiResultFormatter {
  buffer: string;
  generatedCards: FlashCard[];

  constructor() {
    this.buffer = "";
    this.generatedCards = [];
  }

  updateBuffer(chunk: string | undefined | null): FlashCard | null {
    if (!chunk) return null;
    this.buffer += chunk;

    if (this.buffer.startsWith('{"cards":')) {
      this.buffer = this.buffer.replace('{"cards":', "");
    }

    // Strip initial buffer characters
    const startingIndex = this.buffer.indexOf("{");
    if (startingIndex === -1) return null;
    this.buffer = this.buffer.trim().slice(startingIndex); // Remove the opening characters ('[' + spaces and newlines)

    // Skip verification process if one of the two mandatory
    // fields is missing
    let questionFieldFound = this.buffer.includes('"question"');
    let answerFieldFound = this.buffer.includes('"answer"');
    if (!questionFieldFound || !answerFieldFound) return null;

    // Analyze buffer to extract a correct object
    let openingCurlyBracketsCount = 0;
    let closingCurlyBracketsCount = 0;
    let openingSquareBracketsCount = 0;
    let closingSquareBracketsCount = 0;
    let isInString = false;
    let charIdx = -1;

    for (const char of this.buffer) {
      // Increment counters
      charIdx++;
      if (char === "{" && !isInString) openingCurlyBracketsCount++;
      if (char === "}" && !isInString) closingCurlyBracketsCount++;
      if (char === "[" && !isInString) openingSquareBracketsCount++;
      if (char === "]" && !isInString) closingSquareBracketsCount++;
      if (char === '"') isInString = !isInString;

      // If the object is not formed yet, continue searching
      if (openingCurlyBracketsCount === 0) continue;
      if (closingCurlyBracketsCount === 0) continue;
      if (openingSquareBracketsCount === 0) continue;
      if (closingSquareBracketsCount === 0) continue;

      if (
        openingCurlyBracketsCount !== closingCurlyBracketsCount ||
        openingSquareBracketsCount !== closingSquareBracketsCount
      ) {
        continue;
      }

      // Get the object
      const strObj = this.buffer.slice(startingIndex, charIdx + 1);

      // Remove the object from the buffer
      this.buffer = this.buffer.slice(charIdx + 1);
      try {
        const obj = JSON.parse(strObj) as FlashCard;

        const convertAiTextToLaTeX = (
          element: FlashCardContentJSON
        ): FlashCardContentJSON => {
          if (element.type !== "text") return element;
          if (element.text.includes("\\(") && element.text.includes("\\)")) {
            const LaTeXformatted = element.text
              .replaceAll("\\(", "$")
              .replaceAll("\\)", "$");
            const newElement: FlashCardContentJSON = {
              type: "equation",
              equation: `$${LaTeXformatted}$`,
            };
            return newElement;
          }
          if (element.text.match(".*$[^$]+$.*")) {
            const newElement: FlashCardContentJSON = {
              type: "equation",
              equation: element.text,
            };
            return newElement;
          }
          return element;
        };

        obj.id = uuidv4();
        obj.aiGenerated = true;
        obj.question = obj.question.map(convertAiTextToLaTeX);
        obj.answer = obj.answer.map(convertAiTextToLaTeX);

        this.generatedCards.push(obj);
        return obj;
      } catch (e) {
        console.warn(e);
      }
    }
    return null;
  }
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export const AVAILABLE_MODELS = ["gemini-2.0-flash", "gpt-4o"];

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const id = params.get("id");
  if (!id) return serverError("missing-parameters", "Parameter missing: <id>");

  const model = params.get("model");
  if (!model)
    return serverError("missing-parameters", "Parameter missing: <model>");

  if (!AVAILABLE_MODELS.includes(model)) {
    return serverError(
      "invalid-payload",
      "Parameter <model> must be one of : " + AVAILABLE_MODELS.join(", ")
    );
  }


}
function uuidv4(): string {
  throw new Error("Function not implemented.");
}

