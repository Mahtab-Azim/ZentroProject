import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zentro | Agentic Task Manager",
  description:
    "Zentro CRM یک سیستم مدرن برای مدیریت ارتباط با مشتریان، سازمان‌دهی فروش و بهبود تجربه کاربری تیم شماست.",
  keywords: [
    "CRM",
    "Zentro",
    "مدیریت مشتری",
    "سیستم فروش",
    "پنل مدیریت",
    "Next.js",
  ],
  openGraph: {
    title: "Zentro | An Agentic Task Manager",
    description:
      "با Zentro ، تسک های خود را آسان‌تر، سریع‌تر و هوشمندانه‌تر مدیریت کنید.",
    url: "https://zentro.app",
    siteName: "Zentro",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* جلوگیری کامل از فلاش تم و جلوگیری از hydration error */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>

      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
