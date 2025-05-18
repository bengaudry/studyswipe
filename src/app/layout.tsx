import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Poppins } from "next/font/google";
import { AppLayout } from "@/components/AppLayout";
import { AppNavbar } from "@/components/AppNavbar";

import "./globals.css";
import "katex/dist/katex.min.css";

const poppins400 = Poppins({
  weight: "400",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Studyswipe",
  description: "An app that allows you to study your courses with flashcards.",
  icons: { icon: "/icon-png.png" },
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en">
      <body
        className={`${poppins400.className} antialiased`}
      >
        <Analytics />
        <AppLayout>
          <AppNavbar />
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
