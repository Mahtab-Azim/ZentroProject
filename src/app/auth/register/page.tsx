'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, User, Mail, Lock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-400'}`}>
    {met ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
    <span>{text}</span>
  </div>
)

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: ''
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

    if (name === 'password') {
      checkPasswordStrength(value)
    }
  }

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordStrong) return

    setIsLoading(true)
    setError("")

    try {
      const registerResponse = await fetch('http://127.0.0.1:8000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          active: true
        }),
      })

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json()
        throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'خطا در ثبت نام')
      }

      console.log('ثبت نام موفق')

      const formBody = new URLSearchParams()
      formBody.append('username', formData.email)
      formBody.append('password', formData.password)
      formBody.append('grant_type', 'password')

      const loginResponse = await fetch('http://127.0.0.1:8000/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
      })

      if (!loginResponse.ok) {
        throw new Error('ثبت نام موفق بود ولی لاگین خودکار انجام نشد')
      }

      const loginData = await loginResponse.json()

      localStorage.setItem('access_token', loginData.access_token)
      localStorage.setItem('refresh_token', loginData.refresh_token)

      console.log('لاگین خودکار موفق')
      router.push('/dashboard')

    } catch (err) {
      console.error('خطا:', err)
      setError(err instanceof Error ? err.message : 'خطایی رخ داد')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <div
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'oklch(0.6 0.2 240)' }}
          >
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle
            className="text-2xl font-bold text-transparent bg-clip-text"
            style={{ backgroundImage: `linear-gradient(to right, oklch(0.6 0.2 240), oklch(0.55 0.22 240))` }}
          >
            ایجاد حساب کاربری
          </CardTitle>
          <CardDescription className="text-gray-600">
            اطلاعات خود را وارد کنید تا حساب کاربری جدید ایجاد شود
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                نام کامل
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="نام و نام خانوادگی خود را وارد کنید"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                ایمیل
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                رمز عبور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="رمز عبور خود را وارد کنید"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pr-10 pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {formData.password && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">قوت رمز عبور:</h4>
                  <div className="space-y-1">
                    <PasswordRequirement met={passwordStrength.hasMinLength} text="حداقل 8 کاراکتر" />
                    <PasswordRequirement met={passwordStrength.hasUpperCase} text="شامل حروف بزرگ انگلیسی" />
                    <PasswordRequirement met={passwordStrength.hasLowerCase} text="شامل حروف کوچک انگلیسی" />
                    <PasswordRequirement met={passwordStrength.hasNumber} text="شامل عدد" />
                    <PasswordRequirement met={passwordStrength.hasSpecialChar} text="شامل کاراکتر خاص" />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              size="xl"
              disabled={!isPasswordStrong || isLoading}
              className="w-full text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 hover:opacity-90"
              style={{
                background: `linear-gradient(to right, oklch(0.6 0.2 240), oklch(0.55 0.22 240))`,
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال ایجاد حساب...
                </div>
              ) : (
                'ایجاد حساب کاربری'
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              حساب کاربری دارید؟{' '}
              <Link
                href="/auth/login"
                className="font-medium hover:underline transition-colors"
                style={{
                  color: 'oklch(0.6 0.2 240)'
                }}
              >
                وارد شوید
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}