////// GEMINI \\\\\\
export const geminiFlashcardPromptWithDocument = `Task: Extract and generate a granular collection of flashcards strictly from the provided source document.

Source Constraints:
- Strict Adherence: Base all questions and answers exclusively on the provided text. Do not hallucinate or include outside information. 
- Completeness: Extract all key concepts, definitions, and relationships found in the document.

Core Guidelines:
- Interrogative Precision: Every question must be a direct inquiry starting with a question word (e.g., Who, What, Where, When, Why, How). Never use statements or "Fill in the blank" prompts.
- Atomic Knowledge: Deconstruct complex concepts. If a concept has multiple parts, create separate cards for each. Focus on one specific fact per card.
- Response Depth: Provide a direct, accurate answer based on the text. Follow with a single, concise example only if one is present or strongly implied in the source.
- Linguistic Consistency: Maintain the same language used in the source document.
- Stylistic Clarity: Use short, punchy sentences. Avoid unnecessary special characters or conversational filler.

Technical Formatting:
- Mathematical Content: Use LaTeX for all formal variables, formulas, or complex math. 
- Use $inline$ for variables within a sentence.
- Use $$display$$ for standalone equations.
- Do not wrap LaTeX inside markdown code blocks.`;

export const geminiFlashcardPromptWithTopicOnly = `Task: Generate a granular collection of flashcards based on your internal knowledge of the provided topic.

Core Guidelines:
- Interrogative Precision: Every question must be a direct inquiry starting with a question word (e.g., Who, What, Where, When, Why, How). Never use statements or "Fill in the blank" prompts.
- Atomic Knowledge: Deconstruct complex concepts. If a concept has multiple parts, create separate cards for each. Focus on one specific fact per card.
- Response Depth: Provide a direct, accurate answer. Follow the answer with a single, concise example if it clarifies the concept.
- Linguistic Consistency: Maintain the same language used in the user's topic prompt.
- Stylistic Clarity: Use short, punchy sentences. Avoid unnecessary special characters or conversational filler.

Technical Formatting:
- Mathematical Content: Use LaTeX for all formal variables, formulas, or complex math. 
- Use $inline$ for variables within a sentence.
- Use $$display$$ for standalone equations.
- Do not wrap LaTeX inside markdown code blocks.`;


////// GPT \\\\\\
export const gptFlashcardPromptWithTopicOnly = `
You are an expert educator. Generate a structured set of high-quality flashcards about the given topic.

REQUIREMENTS:
- Each flashcard must contain:
  - A clear, specific question written as an actual interrogative sentence (starting with who, what, where, when, why, or how).
  - A precise answer that directly addresses the question.
- Answers should:
  - Be concise but complete.
  - Include a short example ONLY if it improves understanding.
- Language:
  - Use the same language as the input topic.
  - Do not switch languages.
- Structure:
  - Break down the topic into multiple focused flashcards.
  - Avoid combining multiple concepts into a single card.
- Style:
  - Use short, clear sentences.
  - Avoid unnecessary special characters or formatting.
  - Avoid vague or generic questions.
- Coverage:
  - Ensure broad and balanced coverage of the topic (definitions, mechanisms, causes, examples, etc.).
- Mathematical content:
  - Format all equations using LaTeX.`;

export const gptFlashcardPromptWithDocument = `
You are an expert educator. Generate a structured set of high-quality flashcards based ONLY on the provided document.

REQUIREMENTS:
- Base all flashcards strictly on the document content.
- Do NOT invent, assume, or add external knowledge.

- Each flashcard must contain:
  - A clear, specific question written as an actual interrogative sentence (starting with who, what, where, when, why, or how).
  - A precise answer derived directly from the document.

- Answers should:
  - Be concise but complete.
  - Include a short example ONLY if it is present in or clearly supported by the document.

- Language:
  - Use the same language as the document.
  - Do not translate unless explicitly instructed.

- Structure:
  - Extract and split key ideas into multiple focused flashcards.
  - Avoid merging multiple concepts into one card.

- Style:
  - Use short, clear sentences.
  - Avoid unnecessary special characters or formatting.
  - Avoid vague or overly broad questions.

- Coverage:
  - Capture the most important concepts, definitions, relationships, and processes from the document.
  - Prioritize clarity and learning value over completeness.

- Mathematical content:
  - Format all equations using LaTeX.`;