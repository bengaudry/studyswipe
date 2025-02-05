import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DeckPageHeader } from "@/components/pages/deck/DeckPageHeader";
import { DeckPageBody } from "@/components/pages/deck/DeckPageBody";
import { DeckDataProvider } from "@/components/pages/deck/DeckDataProvider";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ deckid: string }>;
}) {
  const deck = await prisma.deck.findUnique({
    where: { id: (await params).deckid },
  });

  if (deck === null) redirect("/");
  
  return (
    <DeckDataProvider initialDeckState={deck}>
      <DeckPageHeader deck={deck} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <DeckPageBody deck={deck} />
      </div>
    </DeckDataProvider>
  );
}
