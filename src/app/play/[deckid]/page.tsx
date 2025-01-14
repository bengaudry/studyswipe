import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CardsDisplayer } from "@/components/pages/play/CardsDisplayer";
import { Check, Plus } from "react-feather";

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

      <CardsDisplayer cards={cards} deckTheme={deck.theme} />

      <div className="fixed h-96 w-32 -bottom-24 left-6 rotate-12 rounded-t-full border-2 border-dashed border-neutral-300 hover:-translate-y-6 transition-all active:scale-95 shadow-xl">
        <div className="w-full aspect-square bg-red-500/20 rounded-full grid place-content-center">
          <Plus className="rotate-45 text-red-800" size={44} />
        </div>
      </div>

      <div className="fixed h-96 w-32 -bottom-24 right-6 -rotate-12 rounded-t-full border-2 border-dashed border-neutral-300 hover:-translate-y-6 transition-all active:scale-95 shadow-xl">
        <div className="w-full aspect-square bg-green-500/20 rounded-full grid place-content-center">
          <Check className="text-green-800" size={44} />
        </div>
      </div>
    </div>
  );
}
