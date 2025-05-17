import { CreateDeckButton } from "@/components/pages/collections/DeckLink";
import { NewCollectionModalTrigger } from "@/components/pages/collections/NewCollectionModal";
import { SkeletonLoader } from "@/components/SkeletonLoader";

export default function CollectionsLoader() {
  return (
    <div className="max-w-screen-sm mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Collections</h1>
        <NewCollectionModalTrigger isDisabled />
      </header>
    </div>
  );
}
