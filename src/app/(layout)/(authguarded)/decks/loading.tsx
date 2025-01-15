import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Spinner } from "@nextui-org/react";

export default function DecksLoader() {
  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Collections</h1>
        <SkeletonLoader className="w-32 h-8 rounded-md" />
      </header>
      <div className="pt-6 grid place-content-center">
        <Spinner />
      </div>
    </div>
  );
}
