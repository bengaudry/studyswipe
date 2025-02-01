import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CardsDisplayer } from "@/components/pages/play/CardsDisplayer";
import { PlaygroundContextProvider } from "@/components/pages/play/PlayerContext";
import { BackButton } from "@/components/BackButton";
import { CardsPlaygroundProgress } from "@/components/pages/play/CardsPlaygroundProgress";

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
    <PlaygroundContextProvider initialCards={cards} theme={deck.theme}>
      <CardsPlaygroundProgress deck={deck} />
      <header className="mt-4 -mx-2 mb-6 flex items-center gap-2">
        <BackButton onlyIcon />
        <div>
          <h1 className="text-xl leading-6 mb-1 font-semibold">{deck.title}</h1>
          <h3 className="text-sm text-neutral-400 -mt-1">@{owner?.pseudo}</h3>
        </div>
      </header>

      <CardsDisplayer />
    </PlaygroundContextProvider>
  );
}
