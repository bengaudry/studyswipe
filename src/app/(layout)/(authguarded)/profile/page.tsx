import { ProfileAvatar } from "@/components/pages/profile/ProfileAvatar";
import { SignOutBtn } from "@/components/pages/profile/SignoutBtn";
import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <>
      <ProfileAvatar src={session?.user?.image} />
      <p>{session?.user?.name}</p>
      <p>{session?.user?.email}</p>
      <SignOutBtn />
    </>
  );
}
