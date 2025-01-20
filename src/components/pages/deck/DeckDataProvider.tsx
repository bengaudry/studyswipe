"use client";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";
import { Deck } from "@prisma/client";

export type MinimalDeck = Omit<
  Deck,
  "id" | "collectionId" | "ownerId" | "createdAt" | "updatedAt"
>;

export const DeckDataContext = createContext<{
  data?: MinimalDeck;
  updateDeckData: Dispatch<SetStateAction<MinimalDeck>>;
}>({ updateDeckData: () => {} });

export const DeckDataProvider = ({
  initialDeckState,
  children,
}: PropsWithChildren<{
  initialDeckState: Deck;
}>) => {
  const [deckState, setDeckState] = useState<MinimalDeck>(initialDeckState);

  return (
    <DeckDataContext.Provider
      value={{ data: deckState, updateDeckData: setDeckState }}
    >
      {children}
    </DeckDataContext.Provider>
  );
};
