"use client";
import { Avatar, AvatarIcon } from "@nextui-org/react";

export function ProfileAvatar({ src }: { src?: string | null }) {
  return (
    <Avatar src={src ?? undefined}>
      <AvatarIcon />
    </Avatar>
  );
}
