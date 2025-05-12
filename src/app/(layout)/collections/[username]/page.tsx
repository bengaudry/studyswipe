import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

import Link from "next/link";
import { Collection } from "@prisma/client";
import { Divider } from "@nextui-org/react";

import { auth } from "@/lib/auth";


const renderDecks = async (collectionId: string) => {
  const decks = await prisma.deck.findMany({
    where: { collectionId, isPublic: true },
    orderBy: { title: "asc" },
  });

  if (decks.length < 1)
    return (
      <p className="mt-2 text-neutral-400">
        No public deck for this collection.
      </p>
    );

  return (
    <div>
      <div className="flex flex-col gap-2 overflow-x-scroll px-6 pb-4 -mx-6">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="group flex items-center justify-between py-1 border-b"
          >
            <Link
              href={`/play/${deck.id}`}
              className={`rounded-xl w-full p-2 transition-colors hover:bg-neutral-100`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 aspect-square bg-${deck.theme}-500 bg-opacity-50 rounded-lg`}
                />
                <div className="flex flex-col">
                  <span className="text-sm leading-4 font-medium">
                    {deck.title}
                  </span>
                  <span className="text-xs leading-4 text-neutral-400">
                    {deck.cards.length} cards
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const renderCollections = (collections: Collection[] | null) => {
  if (collections === null || collections.length < 1)
    return <p className="mt-2 text-neutral-400">No collection for this user.</p>;

  return collections.map((collection, idx) => (
    <div key={collection.id}>
      <div className="pt-4 pb-6">
        <h3 className="text-xl font-medium">{collection.title}</h3>

        {renderDecks(collection.id)}
      </div>
      {idx !== collections.length - 1 && <Divider />}
    </div>
  ));
};

export default async function DecksPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await auth();

  const username = (await params).username;
  console.info(username)

  const user = await prisma.user.findFirst({
    where: { name: username },
  });

  if (user === null) redirect("/?error=user-not-found");
  if (session?.user?.id === user?.id) redirect("/collections");

  const collections = await prisma.collection.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-screen-sm mx-auto">
      <h1 className="text-3xl font-semibold">@{user.name}'s collections</h1>
      <div className="flex flex-col ">{renderCollections(collections)}</div>
    </div>
  );
}
