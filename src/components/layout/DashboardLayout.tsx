'use client';

import { User } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground" dir="rtl">
      <div className="pointer-events-none fixed inset-0 opacity-70 dark:opacity-60 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.28),_transparent_60%)] z-0" />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen pt-28 pb-8 px-4 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}