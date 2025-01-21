import Link from "next/link";
import prisma from "@/lib/prisma";
import { Collection } from "@prisma/client";
import { NewCategoryModal } from "@/components/pages/decks/NewCollectionModal";
import { Divider } from "@nextui-org/react";
import { CreateDeckButton } from "@/components/pages/decks/DeckLink";
import { CollectionOptionsDropdown } from "@/components/pages/decks/CollectionOptionsDropdown";
import { auth } from "@/lib/auth";
import { DeckOptionsDropdown } from "@/components/pages/deck/DeckOptionsDropdown";

const renderDecks = async (collectionId: string) => {
  const decks = await prisma.deck.findMany({ where: { collectionId } });

  return (
    <>
      <div className="flex flex-col gap-2 overflow-x-scroll px-6 pb-4 -mx-6">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="group flex items-center justify-between py-1 border-b"
          >
            <Link
              href={`deck/${deck.id}`}
              className={`rounded-xl w-full p-2 transition-colors hover:bg-neutral-100`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 bg-${deck.theme}-500 bg-opacity-50 rounded-lg`}
                />
                <div className="flex flex-col">
                  <span className="text-sm leading-4 font-medium">
                    {deck.title}
                  </span>
                  <span className="text-xs leading-4 text-neutral-400">
                    {deck.cards.length} cards -{" "}
                    {deck.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </Link>
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <DeckOptionsDropdown deck={deck} />
            </div>
          </div>
        ))}
        <CreateDeckButton collectionId={collectionId} />
      </div>
    </>
  );
};

const renderCollections = (collections: Collection[] | null) => {
  if (collections === null || collections.length < 1)
    return (
      <p className="mt-2 text-neutral-400">
        No deck yet. Start by creating a collection, and then a deck.
      </p>
    );

  return collections.map((collection, idx) => (
    <div key={collection.id}>
      <div className="pt-4 pb-6">
        <div className="flex flex-row items-center justify-between mb-2">
          <h3 className="text-xl font-medium">{collection.title}</h3>
          <CollectionOptionsDropdown collection={collection} />
        </div>

        <div className="flex flex-col">{renderDecks(collection.id)}</div>
      </div>
      {idx < collections.length - 1 && <Divider />}
    </div>
  ));
};

export default async function DecksPage() {
  const session = await auth();

  if (session?.user?.id === undefined) return null;

  const collections = await prisma.collection.findMany({
    where: { ownerId: session.user.id },
  });

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Collections</h1>
        <NewCategoryModal />
      </header>
      <div className="flex flex-col">{renderCollections(collections)}</div>
    </div>
  );
}
