'use client';

import { Home, ListTodo, MessageSquare, Settings, LogOut, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  user: User;
}

export default function Sidebar({ isOpen, onClose, onToggle, user }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: 'داشبورد', href: '/dashboard' },
    { icon: ListTodo, label: 'تسک ها', href: '/tasks' },
    { icon: MessageSquare, label: 'ارتباطات', href: '/messages' },
    { icon: Settings, label: 'تنظیمات', href: '/settings' },
  ];

  return (
    <aside className="h-full bg-sidebar text-sidebar-foreground border-l border-sidebar-border shadow-lg flex flex-col overflow-y-auto overflow-x-hidden transition-colors">
      {/* Mobile Close Button */}
      <div className="lg:hidden p-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Header */}
      <div className="px-5 pt-14 pb-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className={`font-bold text-xl text-primary transition-all ${isOpen ? 'block' : 'hidden'}`}>
            مدیریت تسک‌ها
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-4 pb-4 space-y-2 min-h-0 overflow-y-auto">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Button
              key={item.href}
              variant={active ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-3 h-12 ${active ? 'bg-sidebar-primary/10 text-sidebar-primary' : ''}`}
              onClick={() => router.push(item.href)}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <div className={`flex items-center gap-3 mb-3 ${isOpen ? 'block' : 'justify-center'}`}>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-white">
              {user.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {isOpen && (
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive h-12 cursor-pointer"
          onClick={() => router.push('/auth/logout')}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span>خروج از حساب</span>}
        </Button>
      </div>
    </aside>
  );
}