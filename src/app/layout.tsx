import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppLayout } from "@/components/AppLayout";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/navbar";
import Link from "next/link";
import Image from "next/image";
import { ProfileButton } from "@/components/ProfileButton";
import { PropsWithChildren } from "react";
import "./globals.css";
import { AppNavbar } from "@/components/AppNavbar";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Studyswipe",
  description: "An app that allows you to study your courses with flashcards.",
  icons: { icon: "/icon-png.png" },
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased light`}
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
