"use client";
import { shuffleArray } from "@/lib/arrays";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/react";
import clsx from "clsx";
import { pre } from "framer-motion/client";
import { JSX, ReactNode, useState } from "react";
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
  const [animPlaying, setAnimPlaying] = useState(false);

  const [faceShowed, setFaceShowed] = useState<"question" | "answer">(
    "question"
  );

  const replayCard = () => {
    const currCard = cards[0];
    setSkippedCards((prev) => [...prev, currCard]);
    console.log("skipped :", skippedCards);
    setFaceShowed("question");
    setCards((prev) => prev.slice(1));
    setAnimPlaying(true);
    setTimeout(() => {
      setAnimPlaying(false);
    }, 300);
  };

  const validateCard = () => {
    setFaceShowed("question");
    setCards((prev) => prev.slice(1));
    setAnimPlaying(true);
    setTimeout(() => {
      setAnimPlaying(false);
    }, 300);
  };

  const flipCard = () => {
    setFaceShowed((prev) => (prev === "question" ? "answer" : "question"));
  };

  return (
    <>
      <div className="absolute z-30 top-20 right-3 p-3 rounded-full border shadow-xl">
        <Tooltip content="Shuffle cards" placement="left">
          <button
            onClick={() => setCards((prev) => shuffleArray(prev))}
            className="block p-2 rounded-full aspect-square hover:bg-neutral-100 active:scale-80 transition-all"
          >
            <Shuffle size={20} />
          </button>
        </Tooltip>

        <Tooltip content="Restart" placement="left">
          <button
            onClick={() => {
              setCards(deckCards);
              setSkippedCards([]);
            }}
            className="block p-2 rounded-full aspect-square hover:bg-neutral-100 active:scale-80 transition-all"
          >
            <RefreshCw size={20} />
          </button>
        </Tooltip>
      </div>

      <div
        className={`animate-next-card relative bg-red-400 w-full aspect-square max-w-80 mx-auto `}
      >
        {cards.length > 0 ? (
          <CardElement
            content={cards[0]}
            faceShowed={faceShowed}
            onFlip={flipCard}
            theme={deckTheme}
          />
        ) : (
          <div className="flex flex-col gap-2 items-center">
            <div>
              <p className="text-neutral-400 text-center">
                No card left to play.
              </p>
              <p className="text-neutral-400 text-center">
                {skippedCards.length > 0 && (
                  <>{skippedCards.length} card(s) skipped.</>
                )}
              </p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <Button
                variant="flat"
                color="primary"
                startContent={<RefreshCw />}
                onPress={() => {
                  setCards(deckCards);
                  setSkippedCards([]);
                }}
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

      <ActionButton
        color="red"
        disabled={cards.length < 1}
        onClick={replayCard}
        Icon={<Plus className="rotate-45 text-red-800" size={44} />}
      />

      <ActionButton
        disabled={cards.length < 1}
        color="green"
        position="right"
        onClick={validateCard}
        Icon={<Check className="text-green-800" size={44} />}
      />
    </>
  );
}

const CardElement = ({
  content,
  onFlip,
  theme,
  faceShowed,
}: {
  content: FlashCard;
  onFlip: () => void;
  theme: string;
  faceShowed: "question" | "answer";
}) => {
  return (
    <button
      onClick={onFlip}
      className="w-full h-full hover:scale-95 opacity-100 scale-100 transition-all"
    >
      <FlashcardPreview
        content={content.question}
        decktheme={theme}
        isActive={faceShowed === "question"}
      />
      <FlashcardPreview
        content={content.answer}
        decktheme={theme}
        isActive={faceShowed === "answer"}
      />
    </button>
  );
};

/** The "fingers" at the bottom of the screen */
const ActionButton = ({
  color,
  onClick,
  Icon,
  position = "left",
  disabled,
}: {
  color: string;
  onClick: () => void;
  Icon: JSX.Element;
  position?: "left" | "right";
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`fixed flex items-start h-80 w-32 -bottom-24 ${
      position === "left" ? "left-6 rotate-12" : "right-6 -rotate-12"
    } ${
      disabled
        ? "scale-85 grayscale cursor-default"
        : "hover:-translate-y-6 active:scale-95"
    } rounded-t-full border-2 border-dashed border-neutral-300 transition-all shadow-xl`}
  >
    <div
      className={clsx(
        `w-full aspect-square bg-${color}-100 rounded-full grid place-content-center`
      )}
    >
      {Icon}
    </div>
  </button>
);
