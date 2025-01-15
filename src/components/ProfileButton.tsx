"use client";
import { useSession } from "next-auth/react";
import { Button } from "@nextui-org/button";
import { User } from "react-feather";
import { useRouter } from "next/navigation";
import { SkeletonLoader } from "./SkeletonLoader";

export function ProfileButton() {
  const { data: session } = useSession();
  const { push } = useRouter();

  if (session === null)
    return (
      <Button
        variant="flat"
        color="primary"
        onPress={() => push("/auth")}
        startContent={<User size={20} />}
      >
        Sign in
      </Button>
    );

  if (session === undefined)
    return <SkeletonLoader className="w-20 h-8 rounded-md" />;

  return (
    <Button
      variant="flat"
      color="primary"
      onPress={() => push("/profile")}
      startContent={<User size={20} />}
    >
      Account
    </Button>
  );
}
