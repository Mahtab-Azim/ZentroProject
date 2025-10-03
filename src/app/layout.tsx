import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

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
