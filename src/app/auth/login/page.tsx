'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const router = useRouter()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // ساخت FormData برای OAuth2 password flow
            const formBody = new URLSearchParams()
            formBody.append('username', formData.email) // OAuth2 می‌خواد username باشه (ولی ایمیل رو میفرستیم)
            formBody.append('password', formData.password)
            formBody.append('grant_type', 'password')

            const response = await fetch('http://127.0.0.1:8000/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody.toString()
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'ایمیل یا رمز عبور اشتباه است')
            }

            const data = await response.json()

            // استفاده از login از AuthContext
            login(data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)

            // اطمینان از به‌روزرسانی همه کامپوننت‌ها
            window.dispatchEvent(new Event('userLogin'))

            // کمی صبر می‌کنیم تا state ها به‌روز شوند
            await new Promise(resolve => setTimeout(resolve, 100))

            // دریافت اطلاعات کاربر در AuthContext انجام می‌شود
            const userInfoResponse = await fetch('http://127.0.0.1:8000/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (userInfoResponse.ok) {
                const userInfo = await userInfoResponse.json()
                localStorage.setItem('user_id', userInfo.id)
                localStorage.setItem('user_name', userInfo.full_name)
                localStorage.setItem('user_email', userInfo.email)
            }

            console.log('✅ ورود موفق')

            // Redirect به dashboard
            router.replace('/dashboard')

        } catch (err) {
            console.error('خطا در ورود:', err)
            setError(err instanceof Error ? err.message : 'خطایی رخ داد')
        } finally {
            setIsLoading(false)
        }
    }

    const isValidEmail = formData.email.includes("@") && formData.email.includes(".")
    const isPasswordValid = formData.password.length >= 6

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--auth-bg-start)] via-[var(--auth-bg-mid)] to-[var(--auth-bg-end)] flex items-center justify-center p-4 pt-20">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-sm border-border">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'oklch(0.6 0.2 240)' }}>
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, oklch(0.6 0.2 240), oklch(0.55 0.22 240))` }}>
                        ورود به زنترو
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        به حساب کاربری خود وارد شوید
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                آدرس ایمیل
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
                                    className="pr-10 border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground bg-transparent"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                رمز عبور
                            </Label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    id="password"
                                    name="password"
                                    dir="ltr"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="رمز عبور خود را وارد کنید"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="pr-10 pl-10 border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground bg-transparent text-right"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm font-medium hover:underline transition-colors"
                                style={{
                                    color: 'oklch(0.6 0.2 240)'
                                }}
                            >
                                رمز عبور خود را فراموش کردید؟
                            </Link>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="xl"
                            disabled={!isValidEmail || !isPasswordValid || isLoading}
                            className="w-full text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 hover:opacity-90 cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, oklch(0.6 0.2 240), oklch(0.55 0.22 240))`
                            }}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    در حال ورود...
                                </div>
                            ) : (
                                'ورود'
                            )}
                        </Button>
                    </form>

                    {/* Register Link */}
                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-sm text-muted-foreground">
                            حساب کاربری ندارید؟{' '}
                            <Link
                                href="/auth/register"
                                className="font-medium hover:underline transition-colors"
                                style={{
                                    color: 'oklch(0.6 0.2 240)'
                                }}
                            >
                                ثبت نام کنید
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}