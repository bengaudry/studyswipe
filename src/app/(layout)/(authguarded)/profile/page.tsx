"use client";
import { SignOutBtn } from "@/components/pages/profile/SignoutBtn";
import { Divider, User } from "@nextui-org/react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (session?.user === undefined) return null;

  return (
    <div className="max-w-screen-sm w-full mx-auto">
      <header className="flex items-center justify-between w-full pb-6">
        <User
          avatarProps={{
            src: session.user.image ?? undefined,
            fallback: (session.user.name ?? "-")[0],
          }}
          name={session.user.name}
          description={session.user.email ?? undefined}
        />
        <SignOutBtn />
      </header>

      <Divider />
    </div>
  );
}
