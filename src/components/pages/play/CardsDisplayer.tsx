"use client";
import { shuffleArray } from "@/lib/arrays";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/react";
import clsx from "clsx";
import { pre } from "framer-motion/client";
import { useState } from "react";
import { Check, Home, Play, Plus, RefreshCw, Shuffle } from "react-feather";

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
  const [skippedCards, setSkippedCards] = useState<FlashCard[]>([]);

  const [faceShowed, setFaceShowed] = useState<"question" | "answer">(
    "question"
  );

  const replayCard = () => {
    const currCard = cards[0];
    setSkippedCards((prev) => [...prev, currCard]);
    console.log("skipped :", skippedCards);
    setFaceShowed("question");
    setCards((prev) => prev.slice(1));
  };

  const validateCard = () => {
    setFaceShowed("question");
    setCards((prev) => prev.slice(1));
  };

  return (
    <>
      <div className="absolute top-20 right-3 p-3 rounded-full border shadow-xl">
        <Tooltip content="Shuffle cards" placement="left">
          <button
            onClick={() => setCards((prev) => shuffleArray(prev))}
            className="block p-8 rounded-full aspect-square hover:bg-neutral-100 active:scale-80 transition-all"
          >
            <Shuffle size={20} />
          </button>
        </Tooltip>

        <Tooltip content="Restart" placement="left">
          <button className="block p-8 rounded-full aspect-square hover:bg-neutral-100 active:scale-80 transition-all">
            <RefreshCw size={20} />
          </button>
        </Tooltip>
      </div>

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
            <p className="text-neutral-400 text-center">
              No card left to play.
              {skippedCards.length > 0 && (
                <p>{skippedCards.length} cards skipped.</p>
              )}
            </p>
            <div className="flex flex-row gap-4 items-center">
              <Button
                variant="flat"
                color="primary"
                startContent={<RefreshCw />}
                onPress={() => setCards(deckCards)}
              >
                Restart
              </Button>
              {skippedCards.length > 0 && (
                <Button
                  color="primary"
                  startContent={<Play />}
                  onPress={() => {
                    setCards(skippedCards);
                    setSkippedCards([]);
                  }}
                >
                  Play skipped
                </Button>
              )}
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
