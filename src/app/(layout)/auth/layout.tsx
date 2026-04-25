import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import {getUser} from "@/lib/session";

export default async function AuthLayout({ children }: PropsWithChildren) {
  const user = await getUser();
  if (user) redirect("/profile");
  return children;
}
