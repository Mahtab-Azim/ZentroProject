// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      token?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    avatar?: string;
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    token?: string;
  } 
}