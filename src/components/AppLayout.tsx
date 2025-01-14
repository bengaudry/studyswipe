"use client";

import { NextUIProvider } from "@nextui-org/react";
import { PropsWithChildren } from "react";

export function AppLayout({ children }: PropsWithChildren) {
  return <NextUIProvider>{children}</NextUIProvider>;
}
