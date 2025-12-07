'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { AuthBackground } from "@/components/auth/AuthBackground"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                setIsSubmitted(true)
            } else {
                setError(data.error || "خطایی رخ داده است")
            }
        } catch (err) {
            setError("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید")
        } finally {
            setIsLoading(false)
        }
    }

    const isValidEmail = email.includes("@") && email.includes(".")

    if (isSubmitted) {
        return (
            <div className="min-h-screen relative z-0 flex items-center justify-center p-4 pt-20 overflow-hidden">
                <AuthBackground />

                <Card className="w-full max-w-md border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl backdrop-saturate-150 transition-all duration-500">
                    <CardHeader className="text-center pb-2 pt-8">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-100/80 dark:bg-green-900/30 backdrop-blur-sm flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                            ایمیل ارسال شد
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                            لینک بازیابی رمز عبور به ایمیل شما ارسال شد
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                        <div className="space-y-4">
                            <div className="bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50 rounded-xl p-4">
                                <p className="text-sm text-green-700 dark:text-green-300 text-center">
                                    لطفاً ایمیل <strong>{email}</strong> را بررسی کنید و روی لینک بازیابی کلیک کنید.
                                </p>
                            </div>

                            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                <p>ایمیل را دریافت نکردید؟</p>
                                <button
                                    onClick={() => {
                                        setIsSubmitted(false)
                                        setEmail("")
                                    }}
                                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-1"
                                >
                                    دوباره تلاش کنید
                                </button>
                            </div>

                            <Link href="/auth/login" className="block pt-4">
                                <Button
                                    variant="outline"
                                    className="w-full h-10 rounded-full border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/30 hover:bg-white/80 dark:hover:bg-gray-900/50 backdrop-blur-sm font-medium transition-all text-gray-900 dark:text-white"
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    بازگشت به صفحه ورود
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative z-0 flex items-center justify-center p-4 pt-20 overflow-hidden">
            <AuthBackground />

            <Card className="w-full max-w-md border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl backdrop-saturate-150 transition-all duration-500">
                <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                        بازیابی رمز عبور
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                        ایمیل خود را وارد کنید تا لینک بازیابی برای شما ارسال شود
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                آدرس ایمیل
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-10 rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800/50 rounded-xl p-3">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-3">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                💡 پس از ارسال، لینک بازیابی معتبر برای ۲۴ ساعت خواهد بود.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Link href="/auth/login" className="flex-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-10 rounded-full border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/30 hover:bg-white/80 dark:hover:bg-gray-900/50 backdrop-blur-sm font-medium transition-all text-gray-900 dark:text-white"
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    بازگشت
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={!isValidEmail || isLoading}
                                className="flex-1 h-10 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        در حال ارسال...
                                    </div>
                                ) : (
                                    'ارسال لینک بازیابی'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}