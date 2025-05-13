"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileButton } from "./ProfileButton";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Image,
  Link,
} from "@/components/ui";

export function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { prefetch } = useRouter();

  useEffect(() => {
    prefetch("/collections");
  }, []);

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      isBordered
      disableAnimation
    >
      <NavbarBrand>
        <Link href="/" color="foreground" className="flex gap-2 items-center">
          <Image src={"/icon-svg.svg"} width={36} height={36} alt="App icon" />
          <span className="font-semibold">Studyswipe</span>
        </Link>
      </NavbarBrand>
      <NavbarContent justify="center" className="hidden sm:flex gap-4">
        <NavbarItem>
          <Link href="/discover" color="foreground">
            Discover
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/collections" color="foreground">
            My collections
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="md:hidden"
      />
      <NavbarContent justify="end" className="hidden md:flex">
        <ProfileButton />
      </NavbarContent>

      <NavbarMenu>
        <NavbarMenuItem>
          <Link
            href="/discover"
            className="w-full text-center"
            color="foreground"
            size="lg"
          >
            Discover
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link
            href="/collections"
            className="w-full text-center"
            color="foreground"
            size="lg"
            onMouseEnter={() => prefetch("/decks")}
          >
            My collections
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <ProfileButton
            className="w-full"
            size="lg"
            variant="solid"
            onPress={() => setIsMenuOpen(false)}
          />
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
