'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

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
            // Post Request to API to send Recovery Email
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    //telling to server that, the type of data im sending to you is JSON
                    'Content-Type': 'application/json',
                },
                //body is the content that i send to server
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{background: 'oklch(0.55 0.15 120)'}}>
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-transparent bg-clip-text" style={{backgroundImage: `linear-gradient(to right, oklch(0.55 0.15 120), oklch(0.5 0.18 120))`}}>
                            ایمیل ارسال شد
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            لینک بازیابی رمز عبور به ایمیل شما ارسال شد
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-700 text-center">
                                لطفاً ایمیل <strong>{email}</strong> را بررسی کنید و روی لینک بازیابی کلیک کنید.
                            </p>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            <p>ایمیل را دریافت نکردید؟</p>
                            <button 
                                onClick={() => {
                                    setIsSubmitted(false)
                                    setEmail("")
                                }}
                                className="font-medium hover:underline transition-colors mt-1"
                                style={{color: 'oklch(0.6 0.2 240)'}}
                            >
                                دوباره تلاش کنید
                            </button>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <Link href="/auth/login">
                                <Button 
                                    variant="outline" 
                                    className="w-full border-gray-200 hover:bg-gray-50"
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 pt-20">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{background: 'oklch(0.6 0.2 240)'}}>
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text" style={{backgroundImage: `linear-gradient(to right, oklch(0.6 0.2 240), oklch(0.55 0.22 240))`}}>
                        بازیابی رمز عبور
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        ایمیل خود را وارد کنید تا لینک بازیابی برای شما ارسال شود
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
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
                                'ارسال لینک بازیابی'
                            )}
                        </Button>
                    </form>

                    {/* Guidance */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
                            💡 پس از ارسال، لینک بازیابی معتبر برای ۲۴ ساعت خواهد بود.
                        </p>
                    </div>

                    {/* Back Link */}
                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                            رمز عبور خود را به یاد آوردید؟{' '}
                            <Link 
                                href="/auth/login" 
                                className="font-medium hover:underline transition-colors"
                                style={{
                                    color: 'oklch(0.6 0.2 240)'
                                }}
                            >
                                ورود به حساب
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}