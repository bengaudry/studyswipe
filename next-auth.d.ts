import { DefaultSession, User as DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    userPseudo?: string;
  }
}
