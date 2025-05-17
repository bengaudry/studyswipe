"use client";
import { Deck } from "@prisma/client";
import { NewCardModal } from "./NewCardModal";
import { CardPreview } from "./CardPreview";
import { useContext, useState, Dispatch, SetStateAction } from "react";
import { DeckDataContext } from "./DeckDataProvider";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Button, Checkbox, Tooltip } from "@/components/ui";
import { Copy, Trash2 } from "react-feather";
import { useQuery } from "@tanstack/react-query";

export function DeckPageToolbar({
  selectedCards,
  setSelectedCards,
  isCardDeletionPending,
  handleDeleteCards,
}: {
  selectedCards: string[];
  setSelectedCards?: Dispatch<SetStateAction<string[]>>;
  isCardDeletionPending: boolean;
  handleDeleteCards?: () => void;
}) {
  const { data: deckState } = useContext(DeckDataContext);

  return (
    <header className="flex flex-row items-center gap-2 mb-6">
      <Tooltip content="Select all">
        <Checkbox
          radius="full"
          isSelected={
            selectedCards.length !== 0 &&
            selectedCards.length === deckState?.cards.length
          }
          isDisabled={!deckState || deckState.cards.length === 0}
          onValueChange={(v) => {
            if (!setSelectedCards) return;
            if (!v) setSelectedCards([]);
            else
              setSelectedCards(
                deckState?.cards.map((card) => (card as FlashCard).id) ?? []
              );
          }}
        />
      </Tooltip>
      <Tooltip content="Delete selected cards">
        <Button
          size="md"
          isIconOnly
          isLoading={isCardDeletionPending}
          color="danger"
          variant="flat"
          startContent={
            isCardDeletionPending ? undefined : <Trash2 size={20} />
          }
          isDisabled={!deckState || selectedCards.length === 0}
          onPress={handleDeleteCards}
        />
      </Tooltip>
      <Tooltip content="Duplicate selected cards">
        <Button
          size="md"
          isIconOnly
          variant="flat"
          startContent={<Copy size={20} />}
          isDisabled={
            true ||
            !deckState ||
            selectedCards.length === 0 ||
            isCardDeletionPending
          }
          //onPress={handleDuplicateCards}
        />
      </Tooltip>
    </header>
  );
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

  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const { data: deckState, updateDeckData } = useContext(DeckDataContext);
  const [isAiGeneratingCard, setIsAiGeneratingCard] = useState(false);

  // Handling selected cards deletion
  const {
    isFetching: isCardDeletionPending,
    error: cardDeletionError,
    refetch: callCardDeletionApi,
  } = useQuery({
    queryKey: ["deleteCards"],
    queryFn: () =>
      fetch(`/api/card?deckid=${initialDeck.id}`, {
        method: "DELETE",
        body: JSON.stringify({
          cardIds: selectedCards,
        }),
      }),
    enabled: false,
  });

  const handleDeleteCards = async () => {
    try {
      if (selectedCards.length === 0) return;
      await callCardDeletionApi();
      updateDeckData((prev) => ({
        ...prev,
        cards: prev.cards.filter(
          (v) => !selectedCards.includes((v as FlashCard).id)
        ),
      }));
      setSelectedCards([]);
    } catch (err) {}
  };

  return (
    <>
      <DeckPageToolbar
        handleDeleteCards={handleDeleteCards}
        isCardDeletionPending={isCardDeletionPending}
        selectedCards={selectedCards}
        setSelectedCards={setSelectedCards}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <NewCardModal
          deckid={initialDeck.id}
          card={cardToEdit}
          canUseAiGeneration={hasAccessToPremiumFeatures}
          onAiGenerateCard={() => setIsAiGeneratingCard(true)}
          onAiStopGeneration={() => setIsAiGeneratingCard(false)}
          onCancel={() => setCardToEdit(undefined)}
        />

        {deckState &&
          (deckState.cards as FlashCard[]).map((card, idx) => (
            <CardPreview
              key={idx}
              card={card as FlashCard}
              deckTheme={deckState?.theme}
              onAskEdit={() =>
                setCardToEdit({ data: card as FlashCard, index: idx })
              }
              isBeingDeleted={
                isCardDeletionPending && selectedCards.includes(card.id)
              }
              isSelected={selectedCards.includes(card.id)}
              onSelect={() => setSelectedCards((prev) => [...prev, card.id])}
              onUnSelect={() =>
                setSelectedCards((prev) => prev.filter((id) => id !== card.id))
              }
            />
          ))}
        {isAiGeneratingCard && (
          <SkeletonLoader className="w-full aspect-square border-2 rounded-lg h-full" />
        )}
      </div>
    </>
  );
}
