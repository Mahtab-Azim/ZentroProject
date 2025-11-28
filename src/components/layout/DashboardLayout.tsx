'use client';

import { useState } from 'react';
import { Menu, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from './Sidebar';
import { User } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="relative min-h-screen bg-background text-foreground" dir="rtl">
      <div className="pointer-events-none fixed inset-0 opacity-70 dark:opacity-60 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.28),_transparent_60%)] z-0" />

      {/* Desktop Sidebar - Fixed on right side */}
      <div
        className={`fixed top-20 bottom-0 right-0 z-40 transition-all duration-300 ease-in-out border-l border-border/20 bg-sidebar shadow-lg hidden lg:block ${sidebarOpen ? 'w-64' : 'w-16'}`}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="absolute right-0 top-0 h-full w-64 bg-sidebar shadow-2xl border-l border-border">
          <Sidebar
            isOpen={true}
            onClose={() => setSidebarOpen(false)}
            onToggle={() => setSidebarOpen(false)}
            user={user}
          />
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`relative z-10 min-h-screen pt-28 pb-8 px-4 lg:px-8 transition-all duration-300 ${sidebarOpen ? 'lg:pr-72' : 'lg:pr-24'}`}
      >
        {/* Mobile Menu Button - Only visible on mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-20 right-4 z-30 lg:hidden rounded-full bg-card shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop Toggle Button - Only visible on desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-20 right-4 z-30 hidden lg:flex rounded-full bg-card shadow-md"
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {children}
      </main>
    </div>
  );
}