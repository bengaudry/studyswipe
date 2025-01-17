"use client";
import { shuffleArray } from "@/lib/arrays";
import { Image } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/react";
import clsx from "clsx";
import { JSX, useState } from "react";
import { Check, Play, Plus, RefreshCw, Shuffle } from "react-feather";
import { useSearchParams } from "next/navigation";
import { SkeletonLoader } from "@/components/SkeletonLoader";

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

  if (content.type === "equation") {
    return (
      <Image
        src={`https://latex.codecogs.com/svg.image?${content.equation}`}
        width={200}
        height={25}
        alt={content.equation || "Equation"}
      />
    );
  }

  if (content.type === "quote") {
    return (
      <p
        className={`bg-transparent whitespace-normal px-3 py-1 font-["Imperial_Script",sans-serif] font-medium text-4xl`}
      >
        {"« "}
        {content.content || "Your quote here"}
        {" »"}
      </p>
    );
  }

  if (content.type === "link") {
    let parsedUrl: URL | null;

    try {
      parsedUrl = new URL(content.href);
    } catch (err) {
      return null;
    }

    return (
      <a
        href={content.href}
        target="_blank"
        className="text-blue-600 underline underline-offset-2"
        onClick={(e) => {
          e.preventDefault();
          if (
            confirm(
              "Links are not verified by Studyswipe. Please be sure of what you are doing. Studyswipe will take no responsibility in case of any problem related to this link."
            )
          ) {
            window.open(content.href, "_blank");
          }
        }}
      >
        {parsedUrl.hostname}
      </a>
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
        `absolute inset-0 w-full h-full bg-${decktheme}-500/20 shadow-xl rounded-lg p-6 overflow-y-scroll grid place-content-center gap-2 ${
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

/** If deckCards === undefined, this means the UI is loading */
export function CardsDisplayer({
  deckCards,
  deckTheme,
}: {
  deckCards: FlashCard[] | undefined;
  deckTheme: string;
}) {
  const searchParams = useSearchParams();
  const randomize = searchParams.get("random");
  const [cards, setCards] = useState<FlashCard[]>(
    randomize === "true" ? shuffleArray(deckCards ?? []) : deckCards ?? []
  );
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
      <div className="absolute flex items-center z-30 bottom-3 left-1/2 -translate-x-1/2 rounded-full border shadow-xl bg-white">
        <Tooltip content="Shuffle cards" placement="left">
          <button
            onClick={() => setCards((prev) => shuffleArray(prev))}
            className="block p-3 rounded-full aspect-square hover:bg-neutral-100 active:scale-80 transition-all"
          >
            <Shuffle size={24} />
          </button>
        </Tooltip>

        <Tooltip content="Restart" placement="right">
          <button
            onClick={() => {
              setCards(deckCards ?? []);
              setSkippedCards([]);
            }}
            className="block p-3 rounded-full aspect-square hover:bg-neutral-100 active:scale-80 transition-all"
          >
            <RefreshCw size={24} />
          </button>
        </Tooltip>
      </div>

      <div
        className={`${
          animPlaying ? "animate-next-card" : ""
        } relative w-full aspect-square max-w-80 mx-auto`}
      >
        {deckCards === undefined ? (
          <SkeletonLoader className="rounded-lg w-full h-full absolute inset-0 shadow-xl" />
        ) : cards.length > 0 ? (
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
                  setCards(deckCards ?? []);
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

      <div className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2">
        <div className="relative">
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
        </div>
      </div>
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
      className="w-full h-full md:hover:scale-95 opacity-100 scale-100 transition-all"
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
    className={`absolute flex items-start h-80 w-28 -bottom-32 ${
      position === "left" ? "left-2 rotate-12" : "right-2 -rotate-12"
    } ${
      disabled
        ? "scale-85 grayscale cursor-default"
        : "md:hover:-translate-y-6 active:scale-95"
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
