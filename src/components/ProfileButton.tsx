"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  ButtonProps,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@/components/ui";
import { LogOut, User } from "react-feather";

export function ProfileButton({ onPress, ...props }: ButtonProps) {
  const { data: session } = useSession();
  const { push } = useRouter();

  if (session === null)
    return (
      <Button
        size="sm"
        variant="flat"
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

  return (
    <Dropdown>
      <DropdownTrigger>
        <div className="border-2 rounded-full p-0.5 cursor-pointer">
          <Avatar
            isBordered
            radius="full"
            src={session?.user?.image ?? undefined}
          />
        </div>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem
          key="logout"
          variant="flat"
          color="danger"
          startContent={<LogOut size={16} />}
          onPress={() => signOut()}
        >
          Sign out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <Button
      size="sm"
      variant="flat"
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
