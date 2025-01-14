import { NewCardModal } from "@/components/pages/deck/NewCardModal";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { ChevronLeft, Play } from "react-feather";

export default async function DeckPageLoader() {
  return (
    <div>
      <header className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between items-center gap-4">
          <Link href=".." className="text-neutral-400 flex items-center mb-3">
            <ChevronLeft />
            <span> Back</span>
          </Link>
          <Button size="sm" startContent={<Play fill="#fff" size={18} />}>
            Launch
          </Button>
        </div>
        <div className="flex justify-between items-center gap-4">
          <SkeletonLoader className="rounded-lg">
            <h1 className="text-2xl font-semibold">Deck title</h1>
          </SkeletonLoader>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <NewCardModal deckid={""} decktheme={"neutral"} />
      </div>
    </div>
  );
}
