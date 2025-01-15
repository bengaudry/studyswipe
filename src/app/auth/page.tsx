"use client";

import { Button } from "@nextui-org/button";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  return (
    <div className="grid place-content-center w-full h-full">
      <Button onPress={() => signIn("google", { redirectTo: "/decks" })}>
        Sign in with Google
      </Button>
    </div>
  );
}
