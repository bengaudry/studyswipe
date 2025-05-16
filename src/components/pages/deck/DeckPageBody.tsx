"use client";
import { Deck } from "@prisma/client";
import { NewCardModal } from "./NewCardModal";
import { CardPreview } from "./CardPreview";
import { useContext, useState, useRef } from "react";
import { DeckDataContext } from "./DeckDataProvider";
import { SkeletonLoader } from "@/components/SkeletonLoader";

function useDeleteQueue(deckId: string, updateDeckData: any) {
  const queue = useRef<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const processQueue = async () => {
    if (processing || queue.current.length === 0) return;
    setProcessing(true);

    while (queue.current.length > 0) {
      const cardId = queue.current[0];
      try {
        const res = await fetch(`/api/card?deckid=${deckId}&cardid=${cardId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      } catch {}
      queue.current.shift();
    }
    setProcessing(false);
  };

  const enqueueDelete = (cardId: string) => {
    updateDeckData((prev: any) => ({
      ...prev,
      cards: prev.cards.filter((card: any) => card.id !== cardId),
    }));
    queue.current.push(cardId);
    processQueue();
  };

  return enqueueDelete;
}

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

  const enqueueDelete = useDeleteQueue(initialDeck.id, updateDeckData);

  const handleDeleteCard = (cardid: string) => enqueueDelete(cardid);

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
