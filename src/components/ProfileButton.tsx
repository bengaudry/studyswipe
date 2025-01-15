"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@nextui-org/button";
import { User } from "react-feather";
import { useRouter } from "next/navigation";

export function ProfileButton() {
  const { data: session } = useSession();
  const { push } = useRouter();

  const handlePress = () => {
    if (session === null) {
      push("/auth");
    } else push("/profile");
  };

  return (
    <Button onPress={handlePress} startContent={<User size={20} />}>
      {session === null ? "Sign in" : "Profile"}
    </Button>
  );
}
