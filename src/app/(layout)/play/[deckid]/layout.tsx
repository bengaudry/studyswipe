import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PropsWithChildren } from "react";

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

  const session = await auth();
  if (collection.ownerId === session?.user?.id) return children;

  return <p>This deck does not seem to exist</p>;
}
