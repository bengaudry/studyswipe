"use client";
import { Button } from "@nextui-org/button";
import clsx from "clsx";
import { pre } from "framer-motion/client";
import { useState } from "react";
import { Check, Home, Plus, RefreshCw } from "react-feather";

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
          isActive
            ? "scale-100 opacity-100 shadow-neutral-500/20"
            : "scale-85 opacity-0 shadow-neutral-500/0"
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
  deckCards,
  deckTheme,
}: {
  deckCards: FlashCard[];
  deckTheme: string;
}) {
  const [cards, setCards] = useState(deckCards);
  const [stats, setStats] = useState({ skipped: 0, validated: 0 });

  const [faceShowed, setFaceShowed] = useState<"question" | "answer">(
    "question"
  );

  const replayCard = () => {
    const currCard = cards[0];
    setFaceShowed("question");
    setStats((prev) => ({
      skipped: prev.skipped + 1,
      validated: prev.validated,
    }));
    setCards((prev) => [...prev.slice(1), currCard]);
  };

  const validateCard = () => {
    setFaceShowed("question");
    setStats((prev) => ({
      skipped: prev.skipped,
      validated: prev.validated + 1,
    }));
    setCards((prev) => prev.slice(1));
  };

  return (
    <>
      <div className="relative w-full aspect-square max-w-80 mx-auto">
        {cards.length > 0 ? (
          <button
            onClick={() =>
              setFaceShowed((prev) =>
                prev === "question" ? "answer" : "question"
              )
            }
            className="w-full h-full scale-100 hover:scale-95 transition-transform"
          >
            <FlashcardPreview
              content={cards[0].question}
              decktheme={deckTheme}
              isActive={faceShowed === "question"}
            />
            <FlashcardPreview
              content={cards[0].answer}
              decktheme={deckTheme}
              isActive={faceShowed === "answer"}
            />
          </button>
        ) : (
          <div className="flex flex-col gap-2 items-center">
            <p className="text-neutral-400 text-center">No card to play.</p>
            <p>
              {stats.skipped} cards skipped / {stats.validated} cards validated
            </p>
            <div className="flex flex-row gap-4 items-center">
              <Button
                variant="flat"
                color="primary"
                startContent={<RefreshCw />}
                onPress={() => setCards(deckCards)}
              >
                Play again
              </Button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={replayCard}
        className="fixed flex items-start h-80 w-32 -bottom-24 left-6 rotate-12 rounded-t-full border-2 border-dashed border-neutral-300 hover:-translate-y-6 transition-all active:scale-95 shadow-xl"
      >
        <div className="w-full aspect-square bg-red-100 rounded-full grid place-content-center">
          <Plus className="rotate-45 text-red-800" size={44} />
        </div>
      </button>

      <button
        onClick={validateCard}
        className="fixed flex items-start h-80 w-32 -bottom-24 right-6 -rotate-12 rounded-t-full border-2 border-dashed border-neutral-300 hover:-translate-y-6 transition-all active:scale-95 shadow-xl"
      >
        <div className="w-full aspect-square bg-green-100 rounded-full grid place-content-center">
          <Check className="text-green-800" size={44} />
        </div>
      </button>
    </>
  );
}
