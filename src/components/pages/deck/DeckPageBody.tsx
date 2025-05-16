"use client";
import { Deck } from "@prisma/client";
import { NewCardModal } from "./NewCardModal";
import { CardPreview } from "./CardPreview";
import { useContext, useState } from "react";
import { DeckDataContext } from "./DeckDataProvider";
import { SkeletonLoader } from "@/components/SkeletonLoader";

export function DeckPageBody({
  deck: initialDeck,
  hasAccessToPremiumFeatures,
}: {
  deck: Deck;
  hasAccessToPremiumFeatures: boolean;
}) {
  const [cardToEdit, setCardToEdit] = useState<
    { data: FlashCard; index: number } | undefined
  >(undefined);

  const { data: deckState, updateDeckData } = useContext(DeckDataContext);
  const [isAiGeneratingCard, setIsAiGeneratingCard] = useState(false);

  const handleDeleteCard = (cardid: string) => {
    const prevDeckState = deckState;

    updateDeckData((prev) => ({
      ...prev,
      cards: prev.cards.filter((card) => (card as FlashCard).id !== cardid),
    }));

    fetch(`/api/card?deckid=${initialDeck.id}&cardid=${cardid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch(() => {
      if (prevDeckState) updateDeckData(prevDeckState);
    });
  };

  return (
    <>
      <NewCardModal
        deckid={initialDeck.id}
        card={cardToEdit}
        canUseAiGeneration={hasAccessToPremiumFeatures}
        onAiGenerateCard={() => setIsAiGeneratingCard(true)}
        onAiStopGeneration={() => setIsAiGeneratingCard(false)}
      />

      {deckState &&
        (deckState.cards as FlashCard[]).map((card, idx) => (
          <CardPreview
            key={card.id}
            card={card as FlashCard}
            deckTheme={deckState?.theme}
            onAskDelete={() => handleDeleteCard(card.id)}
            onAskEdit={() =>
              setCardToEdit({ data: card as FlashCard, index: idx })
            }
          />
        ))}
      {isAiGeneratingCard && (
        <SkeletonLoader className="w-full aspect-square border-2 rounded-lg h-full" />
      )}
    </>
  );
}
