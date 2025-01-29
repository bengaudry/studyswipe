"use client";
import { Deck } from "@prisma/client";
import { NewCardModal } from "./NewCardModal";
import { CardPreview } from "./CardPreview";
import { useContext, useState } from "react";
import { DeckDataContext } from "./DeckDataProvider";

export function DeckPageBody({ deck: initialDeck }: { deck: Deck }) {
  const [cardToEdit, setCardToEdit] = useState<
    { data: FlashCard; index: number } | undefined
  >(undefined);

  const { data: deckState, updateDeckData } = useContext(DeckDataContext);

  const handleDeleteCard = async (cardindex: number) => {
    const prevDeckState = deckState;

    try {
      updateDeckData((prev) => ({
        ...prev,
        cards: prev.cards.filter((_, index) => index !== cardindex),
      }));
      await fetch(`/api/card?deckid=${initialDeck.id}&cardindex=${cardindex}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      if (prevDeckState) updateDeckData(prevDeckState);
    }
  };

  return (
    <>
      <NewCardModal
        deckid={initialDeck.id}
        decktheme={deckState?.theme ?? "neutral"}
        card={cardToEdit}
        onCardChange={() => setCardToEdit(undefined)}
      />

      {deckState &&
        deckState.cards.map((card, idx) => (
          <CardPreview
            key={idx}
            card={card as FlashCard}
            deckTheme={deckState?.theme}
            onAskDelete={() => handleDeleteCard(idx)}
            onAskEdit={() =>
              setCardToEdit({ data: card as FlashCard, index: idx })
            }
          />
        ))}
    </>
  );
}
