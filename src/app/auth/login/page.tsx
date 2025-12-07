'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AuthBackground } from "@/components/auth/AuthBackground"
import { api } from '@/lib/api-client'
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
            const formBody = new URLSearchParams()
            formBody.append('username', formData.email)
            formBody.append('password', formData.password)
            formBody.append('grant_type', 'password')

            const data = await api.auth.login(formBody)
            login(data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)
            window.dispatchEvent(new Event('userLogin'))
            await new Promise(resolve => setTimeout(resolve, 100))

            try {
                const userInfo = await api.auth.me(data.access_token)
                localStorage.setItem('user_id', userInfo.id)
                localStorage.setItem('user_name', userInfo.full_name)
                localStorage.setItem('user_email', userInfo.email)
            } catch (err) {
                console.error('Error fetching user info:', err)
            }

            router.replace('/dashboard')

        } catch (err: any) {
            console.error('خطا در ورود:', err)
            setError(err.detail || err.message || 'خطایی رخ داد')
        } finally {
            setIsLoading(false)
        }
    }

    const isValidEmail = formData.email.includes("@") && formData.email.includes(".")
    const isPasswordValid = formData.password.length >= 6

    return (
        <div className="min-h-screen relative z-0 flex items-center justify-center p-4 pt-20 overflow-hidden">
            <AuthBackground />

            {/* Translucent Card - Radix UI Style */}
            <Card className="w-full max-w-md border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl backdrop-saturate-150 transition-all duration-500">
                <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                        ورود به زنترو
                    </CardTitle>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-4">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                آدرس ایمیل
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

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    رمز عبور
                                </Label>
                                <Link
                                    href="/auth/forgotpassword"
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    رمز عبور خود را فراموش کردید؟
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    dir="ltr"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="رمز عبور خود را وارد کنید"
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
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800/50 rounded-xl p-3">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex items-center gap-3 pt-2">
                            <Link href="/auth/register" className="flex-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-10 rounded-full border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/30 hover:bg-white/80 dark:hover:bg-gray-900/50 backdrop-blur-sm font-medium transition-all text-gray-900 dark:text-white"
                                >
                                    ثبت‌نام کنید
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={!isValidEmail || !isPasswordValid || isLoading}
                                className="flex-1 h-10 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}