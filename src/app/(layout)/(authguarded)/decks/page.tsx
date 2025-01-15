import Link from "next/link";
import prisma from "@/lib/prisma";
import { Collection } from "@prisma/client";
import { NewCategoryModal } from "@/components/pages/decks/NewCategoryModal";
import { Divider } from "@nextui-org/react";
import { CreateDeckButton } from "@/components/pages/decks/DeckLink";
import { CollectionOptionsDropdown } from "@/components/pages/decks/CollectionOptionsDropdown";
import { auth } from "@/lib/auth";

const renderDecks = async (collectionId: string) => {
  const decks = await prisma.deck.findMany({ where: { collectionId } });

  return (
    <>
      <div className="flex gap-2 overflow-x-scroll px-6 pb-4 -mx-6">
        <CreateDeckButton collectionId={collectionId} />
        {decks.map((deck) => (
          <Link
            key={deck.id}
            href={`deck/${deck.id}`}
            className={`aspect-square h-40 flex items-end justify-start text-left border border-neutral-200 bg-opacity-10 bg-${deck.theme}-500 rounded-xl p-3 hover:bg-opacity-30 transition-colors`}
          >
            <span className="text-sm leading-4 font-medium">{deck.title}</span>
          </Link>
        ))}
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

  return collections.map(({ id, title }, idx) => (
    <div key={id}>
      <div className="pt-4 pb-6">
        <div className="flex flex-row items-center justify-between mb-2">
          <h3 className="text-xl font-medium">{title}</h3>
          <CollectionOptionsDropdown
            collectionId={id}
            collectionTitle={title}
          />
        </div>

        <div className="flex flex-col">{renderDecks(id)}</div>
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
        <h1 className="text-3xl font-semibold">My decks</h1>
        <NewCategoryModal />
      </header>
      <div className="flex flex-col">{renderCollections(collections)}</div>
    </div>
  );
}
