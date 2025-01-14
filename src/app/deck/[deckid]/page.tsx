import { NewCardModal } from "@/components/pages/deck/NewCardModal";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { redirect } from "next/navigation";
import { clsx } from "clsx";
import { DeckPageHeader } from "@/components/pages/deck/DeckPageHeader";

export default async function DeckPage({
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
      <DeckPageHeader deck={deck} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <NewCardModal deckid={deck.id} decktheme={deck.theme} />

        {cards.map(({ question, answer }, idx) => (
          <button
            key={idx}
            className={clsx(
              `border-2 border-neutral-200 bg-${deck.theme}-500/20 transition-colors rounded-lg p-4 grid place-content-center`
            )}
          >
            {question.map((value) => {
              if (value.type === "text") return value.text;
              if (value.type === "image")
                return <Image src={value.imgUri} alt={value.alt} />;
            })}
          </button>
        ))}
      </div>
    </div>
  );
}
