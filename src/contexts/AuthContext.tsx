"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'

interface AuthContextType {
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  user: any // می‌توانید تایپ دقیق‌تری برای کاربر تعریف کنید
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setIsAuthenticated(true)
      // اینجا می‌توانید اطلاعات کاربر را از API دریافت کنید
      fetchUserInfo(token)
    }
  }, [])

  const fetchUserInfo = async (token: string) => {
    try {
      const userData = await api.auth.me(token)
      setUser(userData)
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const login = (token: string) => {
    localStorage.setItem('access_token', token)
    setIsAuthenticated(true)
    fetchUserInfo(token)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}