"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@nextui-org/button";
import { User } from "react-feather";
import { useRouter } from "next/navigation";
import { SkeletonLoader } from "./SkeletonLoader";
import { Avatar, AvatarIcon } from "@nextui-org/react";
import Link from "next/link";

export function ProfileButton() {
  const { data: session } = useSession();
  const { push } = useRouter();

  const handlePress = () => {
    if (session === null) {
    } else push("/profile");
  };

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
    <Link href="/profile">
      <Avatar
        src={session.user?.image ?? undefined}
        fallback={(session.user?.name ?? "-")[0]}
        isBordered
      >
        <AvatarIcon />
      </Avatar>
    </Link>
  );
}
