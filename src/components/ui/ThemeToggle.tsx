'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemChange = () => {
      // فقط اگر کاربر تم دستی انتخاب نکرده باشه (localStorage خالی باشه)، با سیستم تغییر کن
      if (!localStorage.getItem('theme')) {
        const prefersDark = mediaQuery.matches
        setIsDark(prefersDark)
        if (prefersDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }

    mediaQuery.addEventListener('change', handleSystemChange)
    handleSystemChange() // اولین بار چک کن

    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'))
    })

    observer.observe(root, { attributes: true, attributeFilter: ['class'] })

    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange)
      observer.disconnect()
    }
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    root.classList.toggle('dark')
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light')
    setIsDark(root.classList.contains('dark'))
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative rounded-full hover:bg-accent/70 transition-all duration-300 overflow-hidden"
    >
      <Sun
        className={`h-5 w-5 text-yellow-500 absolute inset-0 m-auto transition-all duration-500 ease-in-out ${
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`h-5 w-5 text-blue-400 absolute inset-0 m-auto transition-all duration-500 ease-in-out ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
      />
      <span className="sr-only">تغییر تم</span>
    </Button>
  )
}