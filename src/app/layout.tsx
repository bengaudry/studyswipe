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
};

export default function RootLayout({
  children,
}: Readonly<PropsWithChildren>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased light`}
      >
        <AppLayout>
          <Navbar isBordered>
            <NavbarBrand>
              <Link href="/" className="flex gap-2 items-center">
                <Image
                  src={"/icon-svg.svg"}
                  width={36}
                  height={36}
                  alt="App icon"
                />
                <span className="font-semibold">Studyswipe</span>
              </Link>
            </NavbarBrand>
            <NavbarContent justify="center">
              <NavbarItem>
                <Link href="/decks" color="foreground">
                  My decks
                </Link>
              </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
              <ProfileButton />
            </NavbarContent>
          </Navbar>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
