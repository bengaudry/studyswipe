import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CardsDisplayer } from "@/components/pages/play/CardsDisplayer";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ deckid: string }>;
}) {
  const deck = await prisma.deck.findUnique({
    where: { id: (await params).deckid },
  });

  if (deck === null) redirect("/");

  const owner = await prisma.user.findFirst({
    where: { id: deck.ownerId },
  });

  const cards = deck.cards as FlashCard[];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-center text-2xl">{deck.title}</h1>
        <h3>@{owner?.pseudo}</h3>
      </header>

      <CardsDisplayer deckCards={cards} deckTheme={deck.theme} />
    </div>
  );
}
