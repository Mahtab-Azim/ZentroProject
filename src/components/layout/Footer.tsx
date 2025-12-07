'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const pathname = usePathname();

  if (pathname?.startsWith('/agent') || pathname?.startsWith('/auth')) return null;

  return (
    <footer className="bg-gradient-to-br from-blue-50 via-blue-100/60 to-indigo-100/60 dark:from-card dark:to-card border-t border-blue-200/50 dark:border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Zentro CRM
            </h3>
            <p className="text-sm text-gray-700 dark:text-muted-foreground text-center md:text-right max-w-xs">
              اولین تسک منیجر با کمک ایجنت
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors hover:underline underline-offset-4">
              خانه
            </Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors hover:underline underline-offset-4">
              داشبورد
            </Link>
            <Link href="#" className="hover:text-primary transition-colors hover:underline underline-offset-4">
              قوانین و مقررات
            </Link>
            <Link href="#" className="hover:text-primary transition-colors hover:underline underline-offset-4">
              تماس با ما
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {currentYear} تمامی حقوق برای Zentro CRM محفوظ است.</p>
          <div className="flex items-center gap-4 opacity-70">
            {/* Social Icons placeholders or similar can go here */}
            <span>طراحی شده با ❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
