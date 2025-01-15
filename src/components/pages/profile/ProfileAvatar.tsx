"use client";
import { Avatar, AvatarIcon } from "@nextui-org/react";
import { useSession } from "next-auth/react";

export function ProfileAvatar() {
  const { data: session } = useSession();

  return (
    <Avatar
      src={session?.user?.image ?? undefined}
      fallback={session?.user?.name ? session.user.name[0] : "-"}
    >
      <AvatarIcon />
    </Avatar>
  );
}
