import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
};

export const { auth, handlers } = NextAuth(authConfig);
