"use client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@nextui-org/button";
import { Deck } from "@prisma/client";
import clsx from "clsx";
import { Play, Shuffle } from "react-feather";
import { DeckOptionsDropdown } from "./DeckOptionsDropdown";
import { useRouter } from "next/navigation";
import { Chip, Tooltip } from "@nextui-org/react";

export function DeckPageHeader({ deck }: { deck: Deck }) {
  const { push } = useRouter();

  return (
    <header className="flex flex-col gap-3 mb-6">
      <div className="flex justify-between items-center gap-4">
        <BackButton />
        <div className="flex gap-2">
          <Tooltip content="Play in random mode">
            <Button
              disabled={deck.cards.length < 1}
              isDisabled={deck.cards.length < 1}
              size="sm"
              onPress={() => push(`/play/${deck.id}?random=true`)}
              startContent={<Shuffle size={18} />}
              isIconOnly
            />
          </Tooltip>
          <Button
            disabled={deck.cards.length < 1}
            isDisabled={deck.cards.length < 1}
            color="primary"
            size="sm"
            className={clsx(`bg-${deck.theme}-500`)}
            onPress={() => push(`/play/${deck.id}`)}
            startContent={<Play fill="#fff" size={18} />}
          >
            Launch
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-1 sm:gap-2 items-center">
          <h1 className="text-xl sm:text-2xl font-semibold">{deck.title}</h1>
          <Chip size="sm" variant="bordered">
            {deck.isPublic ? "Public" : "Private"}
          </Chip>
        </div>
        <DeckOptionsDropdown deck={deck} />
      </div>
    </header>
  );
}
