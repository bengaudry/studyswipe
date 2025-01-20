import { DefaultSession, User as DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    pseudo?: string;
  }

  interface Session {
    user?: { id: string; pseudo?: string } & DefaultSession["user"];
    expires: IsoDateString;
  }
}
