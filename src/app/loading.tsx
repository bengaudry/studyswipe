import { Skeleton } from "@/components/ui";

export default function Loader () {
    return <div className="w-full max-w-screen-md mx-auto px-6 py-3">
        <Skeleton className="w-full h-12 rounded-md mb-2" />
        <Skeleton className="w-full h-8 rounded-md mb-1" />
        <Skeleton className="w-full h-8 rounded-md mb-1" />
        <Skeleton className="w-full h-8 rounded-md mb-1" />
    </div>
}
