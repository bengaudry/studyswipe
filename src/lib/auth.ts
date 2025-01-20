import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

export async function generateUserPseudo(username: string | null | undefined) {
  const base = username || "user";
  const formattedBase = base
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("@", "");

  const nbPseudosExisting = await prisma.user.count({
    where: { pseudo: { startsWith: formattedBase } },
  });
  if (nbPseudosExisting > 0) return `${formattedBase}${nbPseudosExisting}`;
  return formattedBase;
}

export const authConfig: NextAuthConfig = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [Google, GitHub],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
    newUser: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "database",
  },
};

export const { auth, handlers } = NextAuth(authConfig);
