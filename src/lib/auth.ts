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
  callbacks: {
    async signIn({ user, profile }) {
      try {
        const dbUser = await prisma.user.findFirst({ where: { id: user.id } });
        console.info("dbUser pseudo : ", dbUser?.pseudo);
        if (!dbUser) return false;
        if (
          dbUser.pseudo === null ||
          dbUser.pseudo === undefined ||
          dbUser.pseudo === "unknown"
        ) {
          console.info("Generating pseudo for user...");
          const pseudo = await generateUserPseudo(
            user.name ?? profile?.preferred_username ?? profile?.nickname
          );
          console.info("Generated :", pseudo);
          await prisma.user.update({
            where: { id: user.id },
            data: { pseudo },
          });
        }
        return true;
      } catch (err) {
        return false;
      }
    },
    async session({ session, user }) {
      try {
        const dbUser = await prisma.user.findFirst({ where: { id: user.id } });
        console.info("Session fetched pseudo :", dbUser?.pseudo);
        session.userPseudo = dbUser?.pseudo ?? undefined;
        return session;
      } catch (err) {
        return session;
      }
    },
  },

  session: {
    strategy: "database",
  },
};

export const { auth, handlers } = NextAuth(authConfig);
