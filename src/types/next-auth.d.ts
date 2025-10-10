import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    avatar?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      name: string;
      email: string;
      avatar?: string
    };
  }
}