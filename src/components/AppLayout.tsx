"use client";
import { PropsWithChildren, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";

type ColorScheme = "light" | "dark";

export function usePrefersColorScheme(): ColorScheme {
  const getPreference = (): ColorScheme =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    if (typeof window === "undefined") return "light"; // Fallback for SSR
    return getPreference();
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setColorScheme(getPreference());

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return colorScheme;
}

export function AppLayout({ children }: PropsWithChildren) {
  const colorScheme = usePrefersColorScheme();

  useEffect(() => {
    if (
      colorScheme === "dark" &&
      (!document.body.classList.contains("dark") ||
        document.body.classList.contains("light"))
    ) {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    }
    if (
      colorScheme === "light" &&
      (!document.body.classList.contains("light") ||
        document.body.classList.contains("dark"))
    ) {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }
  }, [colorScheme]);

  return (
    <SessionProvider>
      <NextUIProvider>{children}</NextUIProvider>
    </SessionProvider>
  );
}
