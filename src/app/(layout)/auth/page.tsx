"use client";
import { authErrorToMessage } from "@/lib/errorHandling/authErrors";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Alert, Spinner } from "@nextui-org/react";
import { div } from "framer-motion/client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { GitHub } from "react-feather";

export default function AuthPage() {
  const params = useSearchParams();
  const authError = params.get("error");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInRequest = (provider: string) => {
    setIsLoading(true);
    signIn(provider, { redirectTo: "/decks" });
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 w-screen h-screen z-50 grid place-content-center bg-white/50">
          <Spinner />
        </div>
      )}
      <div className="grid place-content-center w-full h-full">
        <div className="flex flex-col items-center w-full max-w-screen-md border-2 rounded-xl px-6 py-12 shadow-xl">
          <div className="text-center w-full max-w-screen-md mx-auto">
            <h1 className="text-3xl font-semibold mb-1">Join Studyswipe</h1>
            <h2 className="text-sm text-neutral-400 text-center max-w-xs mb-4">
              Start learning right now, and become the best in your class.
            </h2>

            {authError && (
              <Alert color="danger" title={authErrorToMessage(authError)} />
            )}

            <div className="flex flex-col my-4 gap-2">
              <Button
                variant="ghost"
                startContent={
                  <Image
                    src={"/google-icon.png"}
                    width={36}
                    height={36}
                    alt="Google icon"
                  />
                }
                className="font-medium w-full"
                onPress={() => handleSignInRequest("google")}
              >
                Continue with Google
              </Button>

              <Button
                variant="solid"
                startContent={
                  <GitHub fill="white" size={22} className="mx-1 block" />
                }
                className="font-medium w-full bg-gradient-to-b from-zinc-700 to-zinc-900 text-white"
                onPress={() => handleSignInRequest("github")}
              >
                Continue with GitHub
              </Button>
            </div>
          </div>

          <Divider className="my-4" />

          <p className="leading-4 text-xs text-neutral-400 max-w-xs text-center">
            By joining, you accept the Terms and Conditions and you confirm that
            you are aware of our Privacy Policy
          </p>
        </div>
      </div>
    </>
  );
}
