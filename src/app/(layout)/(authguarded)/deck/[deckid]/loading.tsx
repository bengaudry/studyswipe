import { BackButton } from "@/components/BackButton";
import { DeckPageToolbar } from "@/components/pages/deck/DeckPageBody";
import { NewCardModalTrigger } from "@/components/pages/deck/NewCardModal";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Button } from "@/components/ui";
import { Play, Shuffle } from "react-feather";

export default async function DeckPageLoader() {
  return (
    <div>
      <header className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between items-center gap-4">
          <BackButton />
          <div className="flex gap-2">
            <Button
              isDisabled
              size="sm"
              startContent={<Shuffle size={18} />}
              isIconOnly
            />
            <Button
              isDisabled
              size="sm"
              startContent={<Play fill="#fff" size={18} />}
            >
              Launch
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-1 sm:gap-2 items-center">
            <SkeletonLoader className="h-7 w-48 rounded-lg" />
          </div>
        </div>
      </header>

      <DeckPageToolbar
        selectedCards={[]}
        isCardDeletionPending={false}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <NewCardModalTrigger isDisabled />
      </div>
    </div>
  );
}
