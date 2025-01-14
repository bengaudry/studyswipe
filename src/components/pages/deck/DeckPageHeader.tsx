import { BackButton } from "@/components/BackButton";
import { Button } from "@nextui-org/button";
import { Deck } from "@prisma/client";
import clsx from "clsx";
import { Play } from "react-feather";
import { DeckOptionsDropdown } from "./DeckOptionsDropdown";

export function DeckPageHeader({ deck }: { deck: Deck }) {
    return (
      <header className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between items-center gap-4">
          <BackButton />
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