'use client';

import React from "react";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, CheckSquare, Users, Zap, Layout, MessageSquareText } from "lucide-react";
import Footer from "@/components/layout/Footer";

export default function FeaturesInterface() {
    const features = [
        {
            icon: <BrainCircuit className="w-10 h-10 text-indigo-500" />,
            title: "هوش مصنوعی و ایجنت‌ها",
            description: "با دستیار هوشمند خود چت کنید، تسک بسازید و پروژه‌ها را مدیریت کنید. قدرت AI در دستان شماست."
        },
        {
            icon: <CheckSquare className="w-10 h-10 text-blue-500" />,
            title: "مدیریت تسک‌ها",
            description: "تسک‌های خود را با جزئیات کامل ایجاد، ویرایش و پیگیری کنید. هیچ وظیفه‌ای از قلم نمی‌افتد."
        },
        {
            icon: <Layout className="w-10 h-10 text-purple-500" />,
            title: "پروژه‌ها و اسپرینت‌ها",
            description: "کارهای بزرگ را به پروژه‌ها و اسپرینت‌های قابل مدیریت بشکنید و پیشرفت تیم را رصد کنید."
        },
        {
            icon: <Users className="w-10 h-10 text-green-500" />,
            title: "همکاری تیمی",
            description: "اعضای تیم را به پروژه‌ها دعوت کنید، نقش تعیین کنید و به صورت هماهنگ کار کنید."
        },
        {
            icon: <MessageSquareText className="w-10 h-10 text-orange-500" />,
            title: "چت هوشمند",
            description: "رابط کاربری چت برای تعامل طبیعی با سیستم. فقط بگویید چه می‌خواهید، ایجنت انجام می‌دهد."
        },
        {
            icon: <Zap className="w-10 h-10 text-yellow-500" />,
            title: "رابط کاربری مدرن",
            description: "تجربه‌ای روان، سریع و زیبا با استفاده از جدیدترین تکنولوژی‌های وب و طراحی واکنش‌گرا."
        }
    ];

    return (
        <div className="min-h-screen relative z-0 flex flex-col pt-40">
            <AuthBackground />

            <main className="flex-grow container mx-auto px-4 pb-20">
                <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        ویژگی‌های برجسته زنترو
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        ابزاری کامل برای مدیریت پروژه‌های شما، تقویت شده با هوش مصنوعی
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in zoom-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <CardHeader className="flex flex-col items-center text-center pb-2">
                                <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-2xl mb-4 shadow-sm">
                                    {feature.icon}
                                </div>
                                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                                    {feature.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center text-gray-600 dark:text-gray-300 leading-relaxed">
                                {feature.description}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>

        </div>
    );
}
