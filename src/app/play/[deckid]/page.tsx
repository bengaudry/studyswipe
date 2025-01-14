import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CardsDisplayer } from "@/components/pages/play/CardsDisplayer";
import { Check, Plus, Shuffle } from "react-feather";
import { Button } from "@nextui-org/button";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ deckid: string }>;
}) {
  const deck = await prisma.deck.findUnique({
    where: { id: (await params).deckid },
  });

  if (deck === null) redirect("/");

  const cards = deck.cards as FlashCard[];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-center text-2xl">{deck.title}</h1>
      </header>

      <CardsDisplayer deckCards={cards} deckTheme={deck.theme} />
    </div>
  );
}
