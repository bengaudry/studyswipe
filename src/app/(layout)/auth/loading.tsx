import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Divider } from "@nextui-org/divider";

export default function AuthLoading() {
  return (
    <div className="grid place-content-center w-full h-full">
      <div className="flex flex-col items-center w-full max-w-screen-sm border-2 rounded-xl px-6 py-12">
        <h1 className="text-3xl font-semibold mb-1">Join Studyswipe</h1>
        <h2 className="text-sm text-neutral-400 text-center max-w-xs mb-4">Start learning right now, and become the best in your class.</h2>

        <SkeletonLoader className="w-full h-8 rounded-xl my-2" />

        <Divider className="my-4" />
        
        <p className="leading-4 text-xs text-neutral-400 max-w-xs text-center">
          By joining, you accept the Condition of Use and you confirm that you are
          aware of our Privacy Policy
        </p>
      </div>
    </div>
  );
}
