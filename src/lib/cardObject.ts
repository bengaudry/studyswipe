const checkFlashCardContent = (
  content: any,
  parentType: string,
  parentLine: number,
  parentColumn: number
): string | null => {
  if (!Array.isArray(content)) {
    return `Error at line ${parentLine}, column ${parentColumn}: ${parentType} should be an array of FlashCardContentJSON.`;
  }

  for (let i = 0; i < content.length; i++) {
    const item = content[i];
    if (typeof item !== "object" || !item || !item.type) {
      return `Error at line ${
        parentLine + i
      }, column ${parentColumn}: FlashCardContentJSON object expected, found ${typeof item}.`;
    }

    switch (item.type) {
      case "text":
        if (!["title", "subtitle", "paragraph"].includes(item.heading)) {
          return `Error at line ${
            parentLine + i
          }, column ${parentColumn}: 'heading' should be 'title', 'subtitle', or 'paragraph'. Found: ${
            item.heading
          }.`;
        }
        if (typeof item.text !== "string") {
          return `Error at line ${
            parentLine + i
          }, column ${parentColumn}: 'text' should be a string. Found: ${typeof item.text}.`;
        }
        break;

      case "image":
        if (typeof item.alt !== "string") {
          return `Error at line ${
            parentLine + i
          }, column ${parentColumn}: 'alt' should be a string. Found: ${typeof item.alt}.`;
        }
        if (typeof item.imgUri !== "string") {
          return `Error at line ${
            parentLine + i
          }, column ${parentColumn}: 'imgUri' should be a string. Found: ${typeof item.imgUri}.`;
        }
        if (item.width && typeof item.width !== "number") {
          return `Error at line ${
            parentLine + i
          }, column ${parentColumn}: 'width' should be a number. Found: ${typeof item.width}.`;
        }
        if (item.height && typeof item.height !== "number") {
          return `Error at line ${
            parentLine + i
          }, column ${parentColumn}: 'height' should be a number. Found: ${typeof item.height}.`;
        }
        break;

      case "equation":
        if (typeof item.equation !== "string") {
          return `Error at line ${
            parentLine + i
          }, column ${parentColumn}: 'equation' should be a string. Found: ${typeof item.equation}.`;
        }
        break;

      case "quote":
        if (typeof item.content !== "string") {
          return `Error at line ${
            parentLine + i
          }, column ${parentColumn}: 'content' should be a string. Found: ${typeof item.content}.`;
        }
        if (item.author && typeof item.author !== "string") {
          return `Error at line ${
            parentLine + i
          }, column ${parentColumn}: 'author' should be a string. Found: ${typeof item.author}.`;
        }
        if (item.year && typeof item.year !== "number") {
          return `Error at line ${
            parentLine + i
          }, column ${parentColumn}: 'year' should be a number. Found: ${typeof item.year}.`;
        }
        break;

      case "link":
        if (typeof item.href !== "string") {
          return `Error at line ${
            parentLine + i
          }, column ${parentColumn}: 'href' should be a string. Found: ${typeof item.href}.`;
        }
        break;

      default:
        return `Error at line ${
          parentLine + i
        }, column ${parentColumn}: Unknown 'type' found: ${item.type}.`;
    }
  }

  return null;
};

export function validateFlashCardArray(
  obj: any,
  line: number = 0,
  column: number = 0
): FlashCard[] | string {
  if (!Array.isArray(obj)) {
    return `Error at line ${line}, column ${column}: Expected an array of FlashCard objects, found ${typeof obj}.`;
  }

  for (let i = 0; i < obj.length; i++) {
    const flashCard = obj[i];

    if (typeof flashCard !== "object" || !flashCard) {
      return `Error at line ${
        line + i
      }, column ${column}: Expected an object for FlashCard, found ${typeof flashCard}.`;
    }

    // Validate question and answer for each FlashCard
    const questionError = checkFlashCardContent(
      flashCard.question,
      "question",
      line + i,
      column
    );
    if (questionError) {
      return questionError;
    }

    const answerError = checkFlashCardContent(
      flashCard.answer,
      "answer",
      line + i,
      column
    );
    if (answerError) {
      return answerError;
    }
  }

  return obj; // Return the array of valid FlashCard objects
}
