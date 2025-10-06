import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"

export const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  EmailProvider({
    server: process.env.EMAIL_SERVER!, // مثلا SMTP Gmail یا Mailtrap
    from: process.env.EMAIL_FROM!,    // ایمیلی که می‌خوای لینک‌ها ازش ارسال بشن
  }),
]


