"use client";
import clsx from "clsx";
import { useState } from "react";

function ContentElement({ content }: { content: FlashCardContentJSON }) {
  if (content.type === "text") {
    return (
      <p
        className={`bg-transparent whitespace-normal ${
          content.heading === "title" && "text-2xl font-semibold"
        } ${content.heading === "subtitle" && "text-xl font-medium"}`}
      >
        {content.text || ""}
      </p>
    );
  }
  return null; // Extend here for other content types like images or equations.
}

function FlashcardPreview({
  isActive,
  content,
  decktheme,
}: {
  isActive: boolean;
  content: FlashCardContentJSON[];
  decktheme: string;
}) {
  return (
    <div
      className={clsx(
        `absolute inset-0 w-full h-full bg-${decktheme}-500/20 shadow-xl rounded-lg p-6 overflow-y-scroll grid place-content-center ${
          isActive ? "scale-100 opacity-100 shadow-neutral-500/20" : "scale-85 opacity-0 shadow-neutral-500/0"
        } transition-all`
      )}
    >
      {content.map((value, idx) => (
        <ContentElement key={idx} content={value} />
      ))}
    </div>
  );
}

export function CardsDisplayer({
  cards,
  deckTheme,
}: {
  cards: FlashCard[];
  deckTheme: string;
}) {
  const [faceShowed, setFaceShowed] = useState<"question" | "answer">(
    "question"
  );
  return (
    <div className="relative w-full aspect-square max-w-80 mx-auto">
      {cards.map(({ question, answer }, idx) => (
        <button
          onClick={() =>
            setFaceShowed((prev) =>
              prev === "question" ? "answer" : "question"
            )
          }
          key={idx}
          className="w-full h-full scale-100 hover:scale-95 transition-transform"
        >
          <FlashcardPreview
            content={question}
            decktheme={deckTheme}
            isActive={faceShowed === "question"}
          />
          <FlashcardPreview
            content={answer}
            decktheme={deckTheme}
            isActive={faceShowed === "answer"}
          />
        </button>
      ))}
    </div>
  );
}
