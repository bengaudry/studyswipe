import prisma from "@/lib/prisma";
import { PropsWithChildren } from "react";
import {getUser} from "@/lib/session";

export default async function PlaygroundLayout({
  params,
  children,
}: {
  params: Promise<{ deckid: string }>;
} & Readonly<PropsWithChildren>) {
  const { deckid } = await params;
  const deck = await prisma.deck.findUnique({ where: { id: deckid } });
  const collection = await prisma.collection.findFirst({
    where: { decks: { some: { id: deckid } } },
  });

  if (collection === null || deck === null)
    return <p>This deck does not seem to exist</p>;
  if (deck.isPublic) return children;

  const user = await getUser();
  if (collection.ownerId === user?.id) return children;

  return <p>This deck does not seem to exist</p>;
}
