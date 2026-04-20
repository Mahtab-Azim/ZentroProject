import NextAuth, { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { providers } from "./auth/provider";

import { api } from "./api-client";

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

                try {
                    const formBody = new URLSearchParams();
                    formBody.append("username", email as string);
                    formBody.append("password", password as string);

                    const loginData = await api.auth.login(formBody);
                    const token = loginData.access_token;

                    const user = await api.auth.me(token);

                    return { ...user, token };
                } catch (error) {
                    console.error("Auth error:", error);
                    throw new Error("احراز هویت یا دریافت اطلاعات ناموفق بود. " + (error as any)?.message);
                }
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