"use client";
import { Deck } from "@prisma/client";
import { NewCardModal } from "./NewCardModal";
import { CardPreview } from "./CardPreview";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeckPageBody({
  deck,
  cards,
}: {
  deck: Deck;
  cards: FlashCard[];
}) {
  const [cardToEdit, setCardToEdit] = useState<
    { data: FlashCard; index: number } | undefined
  >(undefined);

  const { refresh } = useRouter();

  const handleDeleteCard = async (cardindex: number) => {
    try {
      await fetch(`/api/card?deckid=${deck.id}&cardindex=${cardindex}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } finally {
      refresh();
    }
  };

  return (
    <>
      <NewCardModal deckid={deck.id} decktheme={deck.theme} card={cardToEdit} />

      {cards.map((card, idx) => (
        <CardPreview
          key={idx}
          card={card}
          deckTheme={deck.theme}
          onAskDelete={() => handleDeleteCard(idx)}
          onAskEdit={() => setCardToEdit({ data: card, index: idx })}
        />
      ))}
    </>
  );
}
