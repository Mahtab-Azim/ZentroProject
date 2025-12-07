'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { AuthBackground } from "@/components/auth/AuthBackground"
import { api } from '@/lib/api-client'

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
    {met ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    <span>{text}</span>
  </div>
)

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  })
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'password') checkPasswordStrength(value)
  }

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean)
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordStrong || !doPasswordsMatch) return

    setIsLoading(true)
    setError("")

    try {
      await api.auth.register({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        active: true
      })

      const formBody = new URLSearchParams()
      formBody.append('username', formData.email)
      formBody.append('password', formData.password)
      formBody.append('grant_type', 'password')

      const loginData = await api.auth.login(formBody)

      localStorage.setItem('access_token', loginData.access_token)
      localStorage.setItem('refresh_token', loginData.refresh_token)
      localStorage.setItem('user_email', formData.email)
      localStorage.setItem('user_name', formData.full_name)

      try {
        const userInfo = await api.auth.me(loginData.access_token)
        localStorage.setItem('user_id', userInfo.id)
      } catch (err) {
        console.error('Error fetching user info:', err)
      }

      router.push('/dashboard')

    } catch (err: any) {
      setError(err.detail?.[0]?.msg || err.detail || err.message || 'خطایی رخ داد')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative z-0 flex items-center justify-center p-4 pt-20 overflow-hidden">
      <AuthBackground />

      {/* Translucent Card - Radix UI Style */}
      <Card className="w-full max-w-md border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl backdrop-saturate-150 transition-all duration-500">
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
            ایجاد حساب کاربری
          </CardTitle>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* نام کامل */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                نام کامل
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="نام و نام خانوادگی"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="h-10 rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
              />
            </div>

            {/* ایمیل */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ایمیل
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-10 rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
              />
            </div>

            {/* رمز عبور */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                رمز عبور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  dir="ltr"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="رمز عبور"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-10 rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all pl-10 text-right text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="space-y-1 p-3 bg-gray-50/70 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">قوت رمز عبور:</p>
                  <PasswordRequirement met={passwordStrength.hasMinLength} text="حداقل 8 کاراکتر" />
                  <PasswordRequirement met={passwordStrength.hasUpperCase} text="شامل حروف بزرگ انگلیسی" />
                  <PasswordRequirement met={passwordStrength.hasLowerCase} text="شامل حروف کوچک انگلیسی" />
                  <PasswordRequirement met={passwordStrength.hasNumber} text="شامل عدد" />
                  <PasswordRequirement met={passwordStrength.hasSpecialChar} text="شامل کاراکتر خاص" />
                </div>
              )}
            </div>

            {/* تایید رمز */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                تایید رمز عبور
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  dir="ltr"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="رمز عبور را مجدداً وارد کنید"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`h-10 rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all pl-10 text-right text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 ${formData.confirmPassword && !doPasswordsMatch ? 'border-red-500 dark:border-red-400' : ''
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && !doPasswordsMatch && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> رمزهای عبور مطابقت ندارند
                </p>
              )}
              {formData.confirmPassword && doPasswordsMatch && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> رمزهای عبور مطابقت دارند
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800/50 rounded-xl p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Link href="/auth/login" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 rounded-full border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/30 hover:bg-white/80 dark:hover:bg-gray-900/50 backdrop-blur-sm font-medium transition-all text-gray-900 dark:text-white"
                >
                  وارد شوید
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={!isPasswordStrong || !doPasswordsMatch || isLoading}
                className="flex-1 h-10 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'در حال ایجاد...' : 'ایجاد حساب کاربری'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}