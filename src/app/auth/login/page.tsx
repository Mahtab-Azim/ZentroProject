'use client'

import React, { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export default function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("")

    const isPasswordValid = password.length >= 8
    const showValidation = password.length > 0


    return (
        <div className="flex items-center justify-center min-h-screen bg-muted">
            <div className="flex flex-col items-center space-y-4 bg-card p-6 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-primary mb-4 text-center">ورود به زنترو</h1>

                <input
                    type="email"
                    placeholder="آدرس ایمیل"
                    className="w-full p-3 border border-border rounded-lg text-right bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="w-full space-y-2">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="رمز عبور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}X
                            className="w-full p-3 pl-12 border border-border rounded-lg text-right bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {showValidation && (
                        <p className={`text-sm ${isPasswordValid ? 'text-green-600' : 'text-red-500'} transition-colors`}>
                            {isPasswordValid ? '✓ رمز عبور معتبر است' : 'رمز عبور حداقل باید ۸ حرف باشد'}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!isPasswordValid || password.length === 0}
                    className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ورود
                </button>
            </div>
        </div>
    )
}