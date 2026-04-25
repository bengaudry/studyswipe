import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import {getUser} from "@/lib/session";

export default async function AuthGuardedLayout({
  children,
}: PropsWithChildren) {
  const user = await getUser();

  console.log("User : ", user)
  if (user === null) redirect(process.env.NEXT_PUBLIC_AUTH_URL as string);

  return children;
}
