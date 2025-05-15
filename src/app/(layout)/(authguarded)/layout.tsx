import { auth } from "@/lib/auth";
import { authCache } from "@/lib/cache";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function AuthGuardedLayout({
  children,
}: PropsWithChildren) {
  const session = await authCache();

  if (session === null) redirect("/auth");
  
  return children;
}
