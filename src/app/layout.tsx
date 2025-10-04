import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zentro CRM | مدیریت ارتباط با مشتریان",
  description:
  "Zentro CRM یک سیستم مدرن برای مدیریت ارتباط با مشتریان، سازمان‌دهی فروش و بهبود تجربه کاربری تیم شماست.",
  keywords: [
    "CRM",
    "Zentro",
    "مدیریت مشتری",
    "سیستم فروش",
    "Next.js",
  ],
  openGraph: {
    title: "Zentro CRM | سیستم مدیریت ارتباط با مشتریان",
    description:
      "با Zentro CRM، تعاملات با مشتریان خود را آسان‌تر، سریع‌تر و هوشمندانه‌تر مدیریت کنید.",
    url: "https://zentro.app", // اگه دامنه‌ات فرق داره بعداً عوضش کن
    siteName: "Zentro CRM",
    images: [
      {
        url: "/og-image.jpg", // یه تصویر مناسب برای اشتراک‌گذاری بذار
        width: 1200,
        height: 630,
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Navbar />
        <main className="pt-16" >
        {children}
        </main>
      </body>
    </html>
  );
}
