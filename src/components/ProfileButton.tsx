"use client";
import { useSession } from "next-auth/react";
import { Button, ButtonProps } from "@nextui-org/button";
import { User } from "react-feather";
import { useRouter } from "next/navigation";
import { SkeletonLoader } from "./SkeletonLoader";

export function ProfileButton({ onPress, ...props }: ButtonProps) {
  const { data: session } = useSession();
  const { push } = useRouter();

  if (session === null)
    return (
      <Button
        variant="flat"
        color="primary"
        onPress={(e) => {
          push("/auth");
          if (onPress) onPress(e);
        }}
        startContent={<User size={20} />}
        {...props}
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
      onPress={(e) => {
        push("/profile");
        if (onPress) onPress(e);
      }}
      startContent={<User size={20} />}
      {...props}
    >
      Account
    </Button>
  );
}
