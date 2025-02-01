"use client";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { Check, Play, Plus, RefreshCw, Shuffle } from "react-feather";
import { Button, Progress, Tooltip } from "@nextui-org/react";

import { shuffleArray } from "@/lib/arrays";
import { ActionButton } from "./ActionButton";
import { FlashcardPreview } from "./FlashcardContent";
import { PlaygroundContext } from "./PlayerContext";
import { useSwipeable } from "react-swipeable";

const SWIPE_CARD_ANIM_DURATION = 500;
const SWIPE_LAST_CARD_ANIM_DURATION = 200;

type AnimParams = {
  isPlaying: boolean;
  type: "skip" | "validate";
};

type AnimatedSwiperWrapperProps = PropsWithChildren<{
  animParams: AnimParams;
  onSkip: () => void;
  onValidate: () => void;
}>;

const AnimatedSwiperWrapper = ({
  children,
  animParams,
  onSkip,
  onValidate,
}: AnimatedSwiperWrapperProps) => {
  const { cards } = useContext(PlaygroundContext);

  const handlers = useSwipeable({
    onSwiped: (e) => {
      if (e.dir === "Left") onSkip();
      if (e.dir === "Right") onValidate();
    },
    preventScrollOnSwipe: true,
  });

  return (
    <div
      {...handlers}
      className={`${
        animParams.isPlaying
          ? animParams.type === "skip"
            ? cards.length === 1
              ? "animate-skip-last-card"
              : "animate-skip-card"
            : cards.length === 1
            ? "animate-validate-last-card"
            : "animate-validate-card"
          : ""
      } relative w-full aspect-square max-w-80 mx-auto transition-all duration-200`}
    >
      {children}
    </div>
  );
};

export function CardsDisplayer() {
  const {
    cards,
    resetCardsToDefault,
    updateCards,
    skippedCards,
    updateSkippedCards,
    counter,
    resetCounter,
    incrementCounter,
    counterOutOf,
    setCounterOutOf,
  } = useContext(PlaygroundContext);

  useEffect(() => {
    document.body.style.overflowY = "hidden";
  });

  const [animParams, setAnimParams] = useState<AnimParams>({
    isPlaying: false,
    type: "skip",
  });

  const [faceShowed, setFaceShowed] = useState<"question" | "answer">(
    "question"
  );
  const [animTimeouts, setAnimTimeouts] = useState<NodeJS.Timeout[]>([]);

  const clearTimeouts = () => {
    animTimeouts.forEach((timeout, idx) => {
      clearTimeout(timeout);
      setAnimTimeouts((prev) => prev.filter((_, i) => i !== idx));
    });
    setAnimParams({ isPlaying: false, type: "skip" });
  };

  const swipeCard = (action: "skip" | "validate") => {
    clearTimeouts();
    if (cards.length == 0) return;

    const currCard = cards[0];
    const prevCardsLength = cards.length;
    setFaceShowed("question");
    setAnimParams({ isPlaying: true, type: action });

    if (action === "skip" && !skippedCards.includes(currCard)) {
      updateSkippedCards((prev) => [...prev, currCard]);
    }

    const updateCardsTimeoutRef = setTimeout(
      () => {
        updateCards((prev) => prev.slice(1));
        incrementCounter();
      },
      prevCardsLength === 1
        ? SWIPE_LAST_CARD_ANIM_DURATION
        : (40 / 100) * SWIPE_CARD_ANIM_DURATION
    );

    const animParamsTimeoutRef = setTimeout(
      () => setAnimParams({ isPlaying: false, type: "skip" }),
      prevCardsLength === 1
        ? SWIPE_LAST_CARD_ANIM_DURATION
        : SWIPE_CARD_ANIM_DURATION
    );

    setAnimTimeouts((prev) => [
      ...prev,
      updateCardsTimeoutRef,
      animParamsTimeoutRef,
    ]);
  };

  const flipCard = () => {
    setFaceShowed((prev) => (prev === "question" ? "answer" : "question"));
  };

  const playSkipped = () => {
    updateCards(skippedCards);
    setCounterOutOf(skippedCards.length);
    updateSkippedCards([]);
    resetCounter();
  };

  return (
    <>
      <ActionDrawer />

      <AnimatedSwiperWrapper
        animParams={animParams}
        onSkip={() => swipeCard("skip")}
        onValidate={() => swipeCard("validate")}
      >
        {cards.length > 0 && (
          <span className="absolute top-full mt-2 right-1 text-neutral-300">
            {counter + 1}/{counterOutOf}
          </span>
        )}
        {cards.length > 0 ? (
          <CardElement
            content={cards[0]}
            faceShowed={faceShowed}
            onFlip={flipCard}
          />
        ) : (
          <div className="flex flex-col gap-2 items-center">
            <div className="grid grid-cols-2 my-6">
              <div className="flex flex-col items-center border-r-2 px-6">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-3xl mt-2 font-semibold">
                  {skippedCards.length}
                </span>
                <p className="text-sm leading-3 text-neutral-400">skipped</p>
              </div>
              <div className="flex flex-col items-center px-6">
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
                <span className="text-3xl mt-2 font-semibold">
                  {counterOutOf - skippedCards.length}
                </span>
                <p className="text-sm leading-3 text-neutral-400">passed</p>
              </div>
            </div>

            <div className="flex flex-row gap-4 items-center">
              <Button
                variant="flat"
                color="primary"
                size="sm"
                startContent={<RefreshCw size={16} />}
                onPress={resetCardsToDefault}
              >
                Restart
              </Button>
              {skippedCards.length > 0 && (
                <Button
                  color="primary"
                  size="sm"
                  startContent={<Play size={16} />}
                  onPress={playSkipped}
                >
                  Play skipped
                </Button>
              )}
            </div>
          </div>
        )}
      </AnimatedSwiperWrapper>

      <div className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2">
        <div className="relative">
          <ActionButton
            color="red"
            disabled={cards.length < 1}
            onClick={() => swipeCard("skip")}
            Icon={<Plus className="rotate-45 text-red-800" size={44} />}
          />

          <ActionButton
            color="green"
            position="right"
            disabled={cards.length < 1}
            onClick={() => swipeCard("validate")}
            Icon={<Check className="text-green-800" size={44} />}
          />
        </div>
      </div>
    </>
  );
}

const ActionDrawer = () => {
  const { updateCards, initialCards, updateSkippedCards, resetCardsToDefault } =
    useContext(PlaygroundContext);

  const shuffleCards = () => {
    updateCards((prev) => shuffleArray(prev));
  };

  return (
    <div className="absolute flex items-center z-30 bottom-3 left-1/2 -translate-x-1/2 rounded-full border shadow-xl bg-white">
      <Tooltip content="Shuffle cards" placement="left">
        <button
          onClick={shuffleCards}
          className="block p-3 rounded-full aspect-square hover:bg-neutral-100 active:scale-80 transition-all"
        >
          <Shuffle size={24} />
        </button>
      </Tooltip>

      <Tooltip content="Restart" placement="right">
        <button
          onClick={resetCardsToDefault}
          className="block p-3 rounded-full aspect-square hover:bg-neutral-100 active:scale-80 transition-all"
        >
          <RefreshCw size={24} />
        </button>
      </Tooltip>
    </div>
  );
};

const CardElement = ({
  content,
  onFlip,
  faceShowed,
}: {
  content: FlashCard;
  onFlip: () => void;
  faceShowed: "question" | "answer";
}) => {
  const { theme } = useContext(PlaygroundContext);

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
