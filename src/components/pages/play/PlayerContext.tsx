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
};

export const PlaygroundContext = createContext<PlaygroundContextT>({
  cards: [],
  initialCards: [],
  updateCards: () => [],
  skippedCards: [],
  updateSkippedCards: () => {},
  theme: "neutral;",
  resetCardsToDefault: () => {},
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
  const [skippedCards, setSkippedCards] = useState<FlashCard[]>([]);

  const resetCardsToDefault = () => {
    setSkippedCards([]);
    setCards(initialCards);
  };

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
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
};
