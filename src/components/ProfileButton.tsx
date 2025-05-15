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
import { Image } from "@/components/ui";
import { LogOut, User, Zap } from "react-feather";
import Link from "next/link";

export function ProfileButton(props: ButtonProps) {
  const { data: session } = useSession();
  const { push } = useRouter();

  if (session === null)
    return (
      <Link href="/auth">
        <Button
          size="sm"
          variant="flat"
          startContent={<User size={20} />}
          {...props}
        >
          Sign in
        </Button>
      </Link>
    );

  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar
          isBordered
          radius="full"
          ImgComponent={(props) => (
            <Image
              src={props.src}
              width={props.width}
              height={props.height}
              className="cursor-pointer"
            />
          )}
          src={session?.user?.image ?? undefined}
        />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem
          key="subscription-link"
          variant="flat"
          showDivider
          startContent={<Zap size={16} />}
          onPress={() => push("/subscription")}
        >
          Subscription
        </DropdownItem>
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
}
