import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function AuthLayout({ children }: PropsWithChildren) {
  const session = await auth();

  if (session) redirect("/profile");

  return children;
}
