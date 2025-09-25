'use client'

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [error, setError] = useState("")
    
    const router = useRouter()

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const result = await signIn("email", {
                email,
                redirect: false,
            })

            if (result?.error) {
                setError("خطا در ارسال ایمیل تایید")
            } else {
                setError("")
                // نمایش پیام موفقیت - ایمیل تایید ارسال شد
                alert("لینک ورود به ایمیل شما ارسال شد")
            }
        } catch (err) {
            setError("خطایی رخ داده است. لطفاً مجدداً تلاش کنید")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true)
        setError("")
        
        try {
            await signIn("google", {
                callbackUrl: "/dashboard"
            })
        } catch (err) {
            setError("خطا در ورود با Google")
            setIsGoogleLoading(false)
        }
    }

    const isValidEmail = email.includes("@") && email.includes(".")

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 pt-20">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{background: 'oklch(0.6 0.2 240)'}}>
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text" style={{backgroundImage: `linear-gradient(to right, oklch(0.6 0.2 240), oklch(0.55 0.22 240))`}}>
                        ورود به زنترو
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        به حساب کاربری خود وارد شوید
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {/* Google Login */}
                    <Button
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                        variant="outline"
                        className="w-full border-gray-200 hover:bg-gray-50"
                    >
                        {isGoogleLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                در حال ورود...
                            </div>
                        ) : (
                            <>
                                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                ورود با Google
                            </>
                        )}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">یا</span>
                        </div>
                    </div>

                    {/* Email/Password Login */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                آدرس ایمیل
                            </Label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* فراموشی رمز عبور */}
                        <div className="text-right">
                            <Link 
                                href="/auth/forgot-password" 
                                className="text-sm font-medium hover:underline transition-colors"
                                style={{
                                    color: 'oklch(0.6 0.2 240)'
                                }}
                            >
                                راهنمایی نیاز دارید؟
                            </Link>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            size="xl"
                            disabled={!isValidEmail || isLoading}
                            className="w-full text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 hover:opacity-90"
                            style={{
                                background: `linear-gradient(to right, oklch(0.6 0.2 240), oklch(0.55 0.22 240))`
                            }}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    در حال ارسال...
                                </div>
                            ) : (
                                'ارسال لینک ورود'
                            )}
                        </Button>
                    </form>

                    {/* لینک ثبت نام */}
                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
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