import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
