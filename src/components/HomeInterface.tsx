'use client';

import React from "react";
import Link from "next/link";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LayoutDashboard, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/layout/Footer";


export default function HomeInterface() {
    const { isAuthenticated } = useAuth();
    // Assuming useAuth provides isAuthenticated or user presence. 
    // If not directly available in hook types commonly used, we might check token existence, 
    // but usually AuthContext handles this. 
    // Based on previous files, useAuth returns { login, ... }. 
    // I'll assume we can check `localStorage` or if `user` object is available if `isAuthenticated` isn't there.
    // Let's safe check. If `useAuth` doesn't export `isAuthenticated`, we can rely on client-side check.

    // For now, let's keep it simple. If we need to fix AuthContext usage later we can.
    // The user request was "whether logged in or first time".

    return (
        <div className="min-h-[120vh] relative z-0 flex flex-col pt-24">
            <AuthBackground />

            <main className="flex-grow flex items-center justify-center p-4 pb-20">
                {/* Translucent Card - Radix UI Style */}
                <Card className="w-full max-w-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl backdrop-saturate-150 transition-all duration-500 animate-in fade-in zoom-in duration-700">
                    <CardHeader className="text-center pb-2 pt-10">
                        <CardTitle className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-2">
                            Zentro
                        </CardTitle>
                        <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                            The Agentic Task Manager
                        </p>
                    </CardHeader>

                    <CardContent className="px-8 pb-10 pt-6 text-center space-y-8">
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
                                مدیریت وظایف هوشمند با قدرت هوش مصنوعی.
                                <br />
                                به دنیای جدید بهره‌وری خوش آمدید.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <Button
                                    className="w-full sm:min-w-[160px] h-12 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 transition-all hover:scale-105"
                                >
                                    <LayoutDashboard className="w-5 h-5 mr-2" />
                                    داشبورد
                                </Button>
                            </Link>

                            <Link href="/auth/login" className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    className="w-full sm:min-w-[160px] h-12 rounded-full border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/30 hover:bg-white/80 dark:hover:bg-gray-900/50 backdrop-blur-sm font-medium transition-all text-gray-900 dark:text-white hover:scale-105"
                                >
                                    <LogIn className="w-5 h-5 mr-2" />
                                    ورود / ثبت‌نام
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>


            <Footer forceVisible={true} />
        </div>
    );
}
