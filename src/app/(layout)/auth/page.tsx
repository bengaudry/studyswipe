"use client";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Alert } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function AuthPage() {
  const params = useSearchParams();
  const authError = params.get("error");

  return (
    <div className="grid place-content-center w-full h-full">
      <div className="flex flex-col items-center w-full max-w-screen-sm border-2 rounded-xl px-6 py-12">
        <h1 className="text-3xl font-semibold mb-1">Join Studyswipe</h1>
        <h2 className="text-sm text-neutral-400 text-center max-w-xs mb-4">
          Start learning right now, and become the best in your class.
        </h2>

        {authError && <Alert color="danger" title={authError} />}

        <Button
          variant="bordered"
          startContent={
            <Image
              src={"/google-icon.png"}
              width={36}
              height={36}
              alt="Google icon"
            />
          }
          className="font-medium my-4 w-full"
          onPress={() => signIn("google", { redirectTo: "/decks" })}
        >
          Continue with Google
        </Button>

        <Divider className="my-4" />

        <p className="leading-4 text-xs text-neutral-400 max-w-xs text-center">
          By joining, you accept the Terms and Conditions and you confirm that
          you are aware of our Privacy Policy
        </p>
      </div>
    </div>
  );
}
