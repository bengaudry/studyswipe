import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { stripe } from "./stripe";

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
  events: {
    async createUser(message) {
      const userId = message.user.id;
      const email = message.user.email;
      const name = message.user.name;
      if (!userId || !email) return;

      const stripeCustomer = await stripe.customers.create({
        email,
        name: name ?? undefined,
      });

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: stripeCustomer.id },
      });
    },
    async signIn(message) {
      const user = message.user;
      const profile = message.profile;
      if (!user.id) return;
      const dbUser = await prisma.user.findFirst({ where: { id: user.id } });
      console.info("dbUser pseudo : ", dbUser?.pseudo);
      if (!dbUser) throw "User does not exist in database";
      if (
        dbUser?.pseudo === null ||
        dbUser?.pseudo === undefined ||
        dbUser?.pseudo === "unknown"
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
      //   const email = message.user.email;
      //   if (!userId || !email) return;

      //   const user = await prisma.user.findUnique({
      //     where: { id: userId },
      //   });
      //   if (
      //     user?.stripeCustomerId === undefined ||
      //     user?.stripeCustomerId === null
      //   ) {
      //     const stripeCustomer = await stripe.customers.create({
      //       email,
      //     });
      //     await prisma.user.update({
      //       where: { id: userId },
      //       data: { stripeCustomerId: stripeCustomer.id },
      //     });
      //   }
    },
  },
  session: {
    strategy: "database",
  },
};

export const { auth, handlers } = NextAuth(authConfig);
