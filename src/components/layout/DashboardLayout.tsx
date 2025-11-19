'use client';

import { useState } from 'react';
import { Menu, Search, Bell, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-60 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.28),_transparent_60%)]" />
      <div className="relative z-10 min-h-screen flex">
      
        {/* Sidebar - همیشه کنار محتوا، نه روی آن */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} hidden lg:block`}>
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-card shadow-2xl border-l border-border">
            <Sidebar 
              isOpen={true} 
              onClose={() => setSidebarOpen(false)} 
              onToggle={() => setSidebarOpen(false)}
              user={user}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navbar - همیشه بالای همه چیز */}
          <header className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-40 shadow-md">
            <div className="flex items-center justify-between h-16 px-4 lg:px-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="rounded-full"
                >
                  {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                <div>
                  <h2 className="text-xl font-bold">داشبورد</h2>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="جستجو..." className="pr-10 w-48 lg:w-64 text-sm bg-background" />
                </div>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}