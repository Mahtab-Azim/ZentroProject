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
    // ثبت‌نام
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

    // لاگین خودکار
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
      throw new Error('لاگین خودکار ناموفق')
    }

    const loginData = await loginResponse.json()

    // ذخیره داده‌ها
    localStorage.setItem('access_token', loginData.access_token)
    localStorage.setItem('refresh_token', loginData.refresh_token)
    localStorage.setItem('user_email', formData.email)
    localStorage.setItem('user_name', formData.full_name)

    // ذخیره اطلاعات کاربر در localStorage
    const userInfoResponse = await fetch('http://127.0.0.1:8000/api/users/me', {
      headers: {
        'Authorization': `Bearer ${loginData.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json()
      localStorage.setItem('user_id', userInfo.id)
    }

    console.log('ورود موفق')
    router.push('/dashboard')

  } catch (err) {
    setError(err instanceof Error ? err.message : 'خطایی رخ داد')
  } finally {
    setIsLoading(false)
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'oklch(0.6 0.2 240)' }}>
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, oklch(0.6 0.2 240), oklch(0.55 0.22 240))` }}>
            ایجاد حساب کاربری
          </CardTitle>
          <CardDescription className="text-gray-600">
            اطلاعات خود را وارد کنید تا حساب کاربری جدید ایجاد شود
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* نام کامل */}
            <div className="space-y-2">
              <Label htmlFor="full_name">نام کامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input id="full_name" name="full_name" type="text" placeholder="نام و نام خانوادگی" value={formData.full_name} onChange={handleInputChange} required className="pr-10" />
              </div>
            </div>

            {/* ایمیل */}
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input id="email" name="email" type="email" placeholder="example@email.com" value={formData.email} onChange={handleInputChange} required className="pr-10" />
              </div>
            </div>

            {/* رمز عبور */}
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="رمز عبور" value={formData.password} onChange={handleInputChange} required className="pr-10 pl-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
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

            {/* تایید رمز */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تایید رمز عبور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="رمز عبور را مجدداً وارد کنید" value={formData.confirmPassword} onChange={handleInputChange} required className={`pr-10 pl-10 ${formData.confirmPassword && !doPasswordsMatch ? 'border-red-300' : ''}`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && !doPasswordsMatch && (
                <p className="text-xs text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3" /> رمزهای عبور مطابقت ندارند</p>
              )}
              {formData.confirmPassword && doPasswordsMatch && (
                <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> رمزهای عبور مطابقت دارند</p>
              )}
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-600">{error}</p></div>}

            <Button type="submit" size="xl" disabled={!isPasswordStrong || !doPasswordsMatch || isLoading} className="w-full cursor-pointer" style={{ background: `linear-gradient(to right, oklch(0.6 0.2 240), oklch(0.55 0.22 240))` }}>
              {isLoading ? 'در حال ایجاد...' : 'ایجاد حساب کاربری'}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              حساب کاربری دارید؟ <Link href="/auth/login" className="font-medium hover:underline" style={{ color: 'oklch(0.6 0.2 240)' }}>وارد شوید</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}