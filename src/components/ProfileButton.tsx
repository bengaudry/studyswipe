"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@nextui-org/button";
import { User } from "react-feather";

export function ProfileButton() {
  const { data: session } = useSession();

  const handlePress = () => {
    if (session === null) {
      signIn();
    } else signOut();
  };

  return (
    <Button onPress={handlePress} startContent={<User />}>
      {session === null ? "Sign in" : "Profile"}
    </Button>
  );
}
