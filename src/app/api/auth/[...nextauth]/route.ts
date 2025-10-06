import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { providers } from "@/lib/auth/provider"

const handler = NextAuth({
  providers: [
    ...providers, // Google & Email
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // بعداً به API backend وصل می‌کنی
        // ✅ مرحله بعد: اتصال به API بک‌اند
        // مثال فرضی:
        // const res = await fetch(`${process.env.BACKEND_URL}/login`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     email: credentials?.email,
        //     password: credentials?.password
        //   })
        // })

        // const user = await res.json()

        // if (!res.ok || !user) {
        //   throw new Error("Invalid credentials")
        // }

        // return user;

        // 🔹 فعلاً حالت تستی
        return {
          id: '1',
          name: 'Test User',
          email: credentials?.email || 'test@test.com',
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }