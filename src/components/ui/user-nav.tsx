'use client'

import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'

interface UserNavProps {
  user: {
    name: string
    email: string
  }
  onLogout: () => void
}

export default function UserNav({ user, onLogout }: UserNavProps) {
  const router = useRouter()

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-background hover:bg-accent transition-[background-color,border-color,box-shadow] duration-200 border border-border hover:border-border/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 cursor-pointer">
          {/* Initials Box */}
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/90 to-primary/70 text-white font-medium text-xs sm:text-sm shadow-sm group-hover:shadow-md transition-[box-shadow] duration-200">
            {initials}
          </div>

          {/* Name (visible on desktop) */}
          <span className="hidden sm:inline text-sm font-medium text-foreground/90">
            {user.name}
          </span>

          {/* Chevron */}
          <ChevronDown size={14} className="text-muted-foreground hidden sm:inline transition-transform duration-200 group-hover:translate-y-0.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 mt-2 p-2" sideOffset={8}>
        {/* Header with gradient background */}
        <div className="relative mb-2 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/90 to-primary/70 text-white font-semibold shadow-sm">
              {initials}
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="px-1 py-1">
          <DropdownMenuItem
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 rounded-md px-3 py-2.5 hover:bg-accent cursor-pointer group"
          >
            <div className="p-1 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm">داشبورد</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2 rounded-md px-3 py-2.5 hover:bg-accent cursor-pointer group"
          >
            <div className="p-1 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
              <Settings className="h-4 w-4" />
            </div>
            <span className="text-sm">تنظیمات</span>
          </DropdownMenuItem>
        </div>

        <div className="p-2 mt-1 border-t">
          <DropdownMenuItem
            onClick={onLogout}
            className="flex items-center gap-2 rounded-md px-3 py-2.5 hover:bg-destructive/10 text-destructive hover:text-destructive cursor-pointer group"
          >
            <div className="p-1 rounded-md bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white transition-colors duration-200">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="text-sm">خروج از حساب</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}