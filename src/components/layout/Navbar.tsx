'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import UserNav from '@/components/ui/user-nav';
import ThemeToggle from '../ui/ThemeToggle';

const publicLinks = [
  { href: '/', label: 'خانه' },
  { href: '/features', label: 'ویژگی‌ها' },
  { href: '/contact', label: 'ارتباطات' },
]

const authLinks = [
  { href: '/dashboard', label: 'داشبورد' },
  { href: '/tasks', label: 'تسک‌های من' },
]

interface User {
  name: string
  email: string
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // چک کردن اولیه و آپدیت کاربر
  // چک کردن کاربر — بدون رفرش، ۱۰۰٪ کار می‌کنه!
  useEffect(() => {
    setIsMounted(true)

    const checkAuth = () => {
      const token = localStorage.getItem('access_token')
      const userName = localStorage.getItem('user_name')
      const userEmail = localStorage.getItem('user_email')

      if (token && userName && userEmail) {
        setUser({ name: userName, email: userEmail })
      } else {
        setUser(null)
      }
    }

    // اولین بار
    checkAuth()

    // هر 500ms چک کن (اصلی‌ترین راه برای همین تب)
    const interval = setInterval(checkAuth, 500)

    // برای تب‌های دیگه
    window.addEventListener('storage', checkAuth)

    // وقتی صفحه دوباره فعال شد (مثل برگشت از لاگین)
    window.addEventListener('focus', checkAuth)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('focus', checkAuth)
    }
  }, [])

  // handleLogout و navLinks رو بیرون useEffect تعریف می‌کنیم
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_id')
    setUser(null)
    router.push('/auth/login')
  }

  if (!isMounted) {
    return null
  }

  const navLinks = user
    ? [...publicLinks, ...authLinks]
    : publicLinks

  return (
    <header className="fixed top-0 w-full backdrop-blur-md bg-background/70 border-b border-border z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">

        {/* Left side - Logo */}
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hover:from-primary/90 hover:to-primary/60 transition-all duration-200"
        >
          زنترو
        </Link>

        {/* Center - Links (desktop) */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }, index) => (
            <div key={href} className="flex items-center gap-8">
              <li className="relative">
                <Link
                  href={href}
                  className={cn(
                    'relative py-2 transition-colors duration-200 text-sm font-medium',
                    pathname === href
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                  )}
                >
                  {label}
                  {pathname === href && (
                    <span className="absolute bottom-0 right-0 h-1 w-full bg-gradient-to-l from-primary to-transparent rounded-full" />
                  )}
                </Link>
              </li>
              {/* خط عمودی بین لینک‌های public و auth */}
              {index === 2 && user && (
                <div className="w-px h-6 bg-border" />
              )}
            </div>
          ))}
        </ul>

        {/* Right side - Auth or User Menu */}
        <div className="flex items-center gap-4">
          < ThemeToggle />

          {user ? (
            <UserNav user={user} onLogout={handleLogout} />
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-primary hover:bg-primary/10 font-medium cursor-pointer"
                >
                  ورود
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 font-medium cursor-pointer"
                >
                  ثبت‌نام
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground hover:text-primary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="relative w-6 h-6">
            <Menu
              className={cn(
                'absolute inset-0 transition-all duration-300',
                isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
              )}
              size={24}
            />
            <X
              className={cn(
                'absolute inset-0 transition-all duration-300',
                isMenuOpen ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
              )}
              size={24}
            />
          </div>
        </Button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-out bg-background/90 backdrop-blur-lg border-t border-border',
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <ul className="flex flex-col gap-2 py-4 px-4">
          {navLinks.map(({ href, label }, index) => (
            <li
              key={href}
              className={cn(
                'transform transition-all duration-300 ease-out',
                isMenuOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0'
              )}
              style={{
                transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
              }}
            >
              <Link
                href={href}
                className={cn(
                  'block py-2 px-3 rounded-lg transition-all duration-200 font-medium text-sm',
                  pathname === href
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:text-primary hover:bg-primary/5'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}

          {!user && (
            <li className="flex gap-2 mt-4 pt-2 border-t border-border ">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  'flex-1 transform transition-all duration-300 ease-out cursor-pointer',
                  isMenuOpen
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0'
                )}
                style={{
                  transitionDelay: isMenuOpen ? `${navLinks.length * 50}ms` : '0ms',
                }}
              >
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  ورود
                </Link>
              </Button>
              <Button
                size="sm"
                asChild
                className={cn(
                  'flex-1 bg-primary hover:bg-primary/90 transform transition-all duration-300 ease-out cursor-pointer',
                  isMenuOpen
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0'
                )}
                style={{
                  transitionDelay: isMenuOpen
                    ? `${(navLinks.length + 1) * 50}ms`
                    : '0ms',
                }}
              >
                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ثبت‌نام
                </Link>
              </Button>
            </li>
          )}
        </ul>
      </div>
    </header>
  )
}