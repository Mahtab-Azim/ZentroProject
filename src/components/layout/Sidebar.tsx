'use client';

import { Home, ListTodo, MessageSquare, Settings, LogOut, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const router = useRouter();
  
  const handleLogout = () => {
    router.push('/auth/logout');
  };

  const menuItems = [
    { icon: Home, label: 'داشبورد', href: '/dashboard', active: true },
    { icon: ListTodo, label: 'وظایف', href: '/tasks', active: false },
    { icon: MessageSquare, label: 'ارتباطات', href: '/messages', active: false },
    { icon: Settings, label: 'تنظیمات', href: '/settings', active: false },
  ];

  return (
    <aside 
      className={`fixed top-0 right-0 h-full bg-background border-l transition-all duration-300 z-40 shadow-xl ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-primary">
              TaskFlow
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.href}
                variant={item.active ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3"
                asChild
              >
                <a href={item.href}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <Separator className="mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
           onClick={() => router.push('/auth/logout')}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">خروج از حساب</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}