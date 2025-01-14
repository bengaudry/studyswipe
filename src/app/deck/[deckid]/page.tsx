import { NewCardModal } from "@/components/pages/deck/NewCardModal";
import prisma from "@/lib/prisma";
import { Button } from "@nextui-org/button";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ChevronLeft, Play } from "react-feather";
import { clsx } from "clsx";
import Link from "next/link";
import { DeckOptionsDropdown } from "@/components/pages/deck/DeckOptionsDropdown";
import { Deck } from "@prisma/client";
import { wait } from "@/lib/time";

export function DeckPageHeader({ deck }: { deck: Deck }) {
  return (
    <header className="flex flex-col gap-3 mb-6">
      <div className="flex justify-between items-center gap-4">
        <Link href=".." className="text-neutral-400 flex items-center mb-3">
          <ChevronLeft />
          <span> Back</span>
        </Link>
        <Button
          color="primary"
          size="sm"
          className={clsx(`bg-${deck.theme}-500`)}
          startContent={<Play fill="#fff" size={18} />}
        >
          Launch
        </Button>
      </div>
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">{deck.title}</h1>
        <DeckOptionsDropdown deckId={deck.id} deckTitle={deck.title} />
      </div>
    </header>
  );
}

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
