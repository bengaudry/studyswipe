"use client";
import { shuffleArray } from "@/lib/arrays";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";

type PlaygroundContextT = {
  cards: FlashCard[];
  initialCards: FlashCard[];
  updateCards: Dispatch<SetStateAction<FlashCard[]>>;
  skippedCards: FlashCard[];
  updateSkippedCards: Dispatch<SetStateAction<FlashCard[]>>;
  theme: string;
  resetCardsToDefault: () => void;
  counter: number;
  resetCounter: () => void;
  incrementCounter: () => void;
  counterOutOf: number,
  setCounterOutOf: Dispatch<SetStateAction<number>>
};

export const PlaygroundContext = createContext<PlaygroundContextT>({
  cards: [],
  initialCards: [],
  updateCards: () => [],
  skippedCards: [],
  updateSkippedCards: () => {},
  theme: "neutral;",
  resetCardsToDefault: () => {},
  counter: 0,
  resetCounter: () => {},
  incrementCounter: () => {},
  counterOutOf: 0,
  setCounterOutOf: () => {}
});

export type PlaygroundContextProps = PropsWithChildren<{
  initialCards: FlashCard[];
  theme: string;
}>;

export const PlaygroundContextProvider = ({
  children,
  initialCards,
  theme,
}: PlaygroundContextProps) => {
  const searchParams = useSearchParams();
  const randomize = searchParams.get("random");

  const [cards, setCards] = useState(
    randomize ? shuffleArray(initialCards) : initialCards
  );
  const [counter, setCounter] = useState(0);
  const [skippedCards, setSkippedCards] = useState<FlashCard[]>([]);
  const [counterOutOf, setCounterOutOf] = useState(initialCards.length);

  /** Restarts the game */
  const resetCardsToDefault = () => {
    setSkippedCards([]);
    setCards(initialCards);
    resetCounter();
    setCounterOutOf(initialCards.length)
  };

  /** Resets the counter of cards swiped to 0 */
  const resetCounter = () => setCounter(0);
  /** Increments the counter of cards swiped by one */
  const incrementCounter = () => setCounter((c) => c + 1);

  return (
    <PlaygroundContext.Provider
      value={{
        cards,
        initialCards,
        updateCards: setCards,
        skippedCards,
        updateSkippedCards: setSkippedCards,
        theme,
        resetCardsToDefault,
        counter,
        resetCounter,
        incrementCounter,
        counterOutOf,
        setCounterOutOf
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
};
