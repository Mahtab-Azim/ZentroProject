import NextAuth, { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { providers } from "./auth/provider";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        // ...providers,
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const { email, password } = credentials;

                const loginResponse = await fetch(`${BASE_URL}/token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: email, password }),
                });

                if (!loginResponse.ok) throw new Error("احراز هویت ناموفق بود");

                const loginData = await loginResponse.json();
                const token = loginData.access_token;

                const userResponse = await fetch(`${BASE_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!userResponse.ok) throw new Error("دریافت اطلاعات کاربر ناموفق بود");

                const user = await userResponse.json();

                return { ...user, token };
            },
        }),
    ],

    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    pages: { signIn: "/auth/login" },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = {
                    id: user.id,
                    name: user.name || "",
                    email: user.email || "",
                    avatar: user.avatar,
                };
                token.token = user.token;
            }
            return token;
        },
        async session({ session, token }): Promise<Session> {
            if (token.user) {
                session.user = {
                    ...session.user,
                    id: token.user.id ?? "",
                    name: token.user.name ?? "",
                    email: token.user.email ?? "",
                    avatar: token.user.avatar,
                    token: token.token as string | undefined,
                };
            }
            return session;
        },
    },
});