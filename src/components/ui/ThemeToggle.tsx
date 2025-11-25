'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark'
    }
    return false
  })

  useEffect(() => {
    // Check localStorage on mount
    const theme = localStorage.getItem('theme')
    const root = document.documentElement

    if (theme === 'dark') {
      setIsDark(true)
      root.classList.add('dark')
    } else {
      setIsDark(false)
      root.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    const newTheme = !isDark ? 'dark' : 'light'

    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('theme', newTheme)
    setIsDark(!isDark)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative rounded-full hover:bg-accent/70 transition-all duration-300 overflow-hidden"
    >
      <Sun
        className={`h-5 w-5 text-yellow-500 absolute inset-0 m-auto transition-all duration-500 ease-in-out pointer-events-none ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
      />
      <Moon
        className={`h-5 w-5 text-blue-400 absolute inset-0 m-auto transition-all duration-500 ease-in-out pointer-events-none ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
      />
      <span className="sr-only">تغییر تم</span>
    </Button>
  )
}