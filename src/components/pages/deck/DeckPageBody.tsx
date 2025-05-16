"use client";
import { Deck } from "@prisma/client";
import { NewCardModal } from "./NewCardModal";
import { CardPreview } from "./CardPreview";
import { Suspense, useContext, useState } from "react";
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
        card={cardToEdit}
        canUseAiGeneration={hasAccessToPremiumFeatures}
        onAiGenerateCard={() => setIsAiGeneratingCard(true)}
        onAiStopGeneration={() => setIsAiGeneratingCard(false)}
      />

      {deckState &&
        deckState.cards.map((card, idx) => (
          <Suspense>
            <CardPreview
              key={idx}
              card={card as FlashCard}
              deckTheme={deckState?.theme}
              onAskDelete={() => handleDeleteCard(idx)}
              onAskEdit={() =>
                setCardToEdit({ data: card as FlashCard, index: idx })
              }
            />
          </Suspense>
        ))}
      {isAiGeneratingCard && (
        <SkeletonLoader className="w-full aspect-square border-2 rounded-lg h-full" />
      )}
    </>
  );
}
