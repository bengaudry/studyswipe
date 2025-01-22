import { CreateDeckButton } from "@/components/pages/decks/DeckLink";
import { NewCollectionModalTrigger } from "@/components/pages/decks/NewCollectionModal";
import { SkeletonLoader } from "@/components/SkeletonLoader";

export default function DecksLoader() {
  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Collections</h1>
        <NewCollectionModalTrigger isDisabled />
      </header>

        <div className="pt-4 pb-6">
      <div className="flex flex-col gap-2 overflow-x-scroll px-6 pb-4 -mx-6">
          <div className="flex flex-row items-center justify-between mb-2">
            <SkeletonLoader className="w-48 h-7 rounded-lg" />
          </div>

        <div className="flex flex-col">
          <div className="group flex items-center gap-3 py-3 px-2 border-b">
            <div
              className={`w-8 h-8 bg-neutral-500 bg-opacity-50 rounded-lg`}
              />
            <div className="flex flex-col">
              <SkeletonLoader className="w-48 h-4 rounded-md" />

              <span className="text-xs leading-4 text-neutral-400">
                0 cards - Private
              </span>
            </div>
          </div>
        </div>
        <CreateDeckButton collectionId="" />
      </div>
              </div>
    </div>
  );
}
