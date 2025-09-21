import NextAuth from "next-auth"
import { providers } from "@/lib/auth/provider"

const handler = NextAuth({
  providers,
  secret: process.env.NEXTAUTH_SECRET,
    })
export { handler as GET, handler as POST }