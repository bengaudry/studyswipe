"use client";
import { SignOutBtn } from "@/components/pages/profile/SignoutBtn";
import { Divider, User } from "@/components/ui";
import {useAuth} from "@/hooks/useAuth";

export default function ProfilePage() {
  const { session } = useAuth();

  if (!session?.user) return null;

  return (
    <div className="max-w-screen-sm w-full mx-auto">
      <header className="flex items-center justify-between w-full pb-6">
        <User
          avatarProps={{
            src: session.user.profilePictureUrl ?? undefined,
            fallback: (session.user.name ?? "-")[0],
          }}
          name={"@" + session.user.name}
          description={session.user.email ?? undefined}
        />
        <SignOutBtn />
      </header>

      <Divider />
    </div>
  );
}
