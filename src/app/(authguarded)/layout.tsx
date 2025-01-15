import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function AuthGuardedLayout({
  children,
}: PropsWithChildren) {
  const session = await auth();

  if (session === null) redirect("/");
  
  return children;
}
