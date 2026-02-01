'use client';

import React, { useState, useEffect } from "react";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Lock, Camera, Loader2, Save } from "lucide-react";
import { api } from "@/lib/api-client";
import { SimpleToast } from "@/components/ui/simple-toast";

export default function SettingsInterface() {
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        // If we know if the user is authenticated (true or false), we can stop initial loading
        if (isAuthenticated !== undefined) {
            // We give some time for user object to be fetched if authenticated
            if (isAuthenticated && !user) {
                return; // Wait for user info
            }
            setIsInitialLoading(false);
        }
    }, [isAuthenticated, user]);

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    // Form States
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        active: "true",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.full_name || user.name || "", // Use full_name if available, fallback to name
                email: user.email || ""
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
            showToast("لطفا مجددا وارد شوید", "error");
            setIsLoading(false);
            return;
        }

        try {
            // Only send fields that are changed/needed
            // Note: backend implementation of PATCH might require only changed fields, or allow partial updates.
            const updateData: any = {};
            if (formData.full_name) updateData.full_name = formData.full_name;
            if (formData.email) updateData.email = formData.email;

            const userId = getUserId();
            if (!userId) {
                showToast("شناسه کاربر یافت نشد. لطفا دوباره وارد شوید.", "error");
                setIsLoading(false);
                return;
            }

            const updatedUser = await api.auth.update(
                userId,
                updateData,
                token
            );


            // Update local storage
            localStorage.setItem('user_name', updatedUser.full_name || updatedUser.name); // Store full_name
            localStorage.setItem('user_email', updatedUser.email);

            showToast("اطلاعات پروفایل با موفقیت بروزرسانی شد", "success");

            // Allow toast to show before reloading
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error: any) {
            showToast(error.message || "خطا در بروزرسانی پروفایل", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            showToast("رمز عبور جدید و تکرار آن مطابقت ندارند", "error");
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        const userId = getUserId();
        if (!userId) {
            showToast("شناسه کاربر یافت نشد. لطفا دوباره وارد شوید.", "error");
            setIsLoading(false);
            return;
        }

        try {
            await api.auth.update(userId, {
                password: formData.newPassword
                // backend might require current_password check, but user request didn't specify strict logic. 
                // Usually standard implementation requires it. Sending only new password for now based on 'simple' request.
            }, token);

            showToast("رمز عبور با موفقیت تغییر کرد", "success");
            setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
        } catch (error: any) {
            showToast(error.message || "خطا در تغییر رمز عبور", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to get user ID from various possible sources
    const getUserId = () => {
        const id = user?.id ?? user?.pk ?? user?.pk_id ?? localStorage.getItem('user_id');
        return (id && id !== "undefined" && id !== "null") ? id : null;
    };

    if (isInitialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative z-0 flex flex-col pt-29 pb-12">
            <AuthBackground />

            <SimpleToast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            <main className="flex-grow container mx-auto px-6 max-w-4xl">
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        تنظیمات حساب کاربری
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        اطلاعات شخصی و امنیتی خود را مدیریت کنید
                    </p>
                </div>

                <div className="grid gap-8">
                    {/* Profile Section */}
                    <Card className="border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" />
                                مشخصات فردی
                            </CardTitle>
                            <CardDescription>
                                نام نمایشی و آدرس ایمیل خود را ویرایش کنید
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="full_name">نام کامل</Label>
                                        <div className="relative">
                                            <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="full_name"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                className="pr-10 bg-white/50 dark:bg-slate-950/50"
                                                placeholder="نام شما"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="email">ایمیل</Label>
                                        <div className="relative">
                                            <Mail className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="pr-10 bg-white/50 dark:bg-slate-950/50"
                                                placeholder="example@mail.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                                        ذخیره تغییرات
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Avatar Section - Placeholder for now as file upload requires backend support usually multipart */}
                    <Card className="border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-purple-500" />
                                تصویر پروفایل
                            </CardTitle>
                            <CardDescription>
                                تصویر پروفایل خود را تغییر دهید (فعلا نمایشی)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="space-y-2">
                                <Button variant="outline" className="border-dashed">
                                    آپلود تصویر جدید
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    تصاویر JPG یا PNG، حداکثر ۲ مگابایت
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Password Section */}
                    <Card className="border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-red-500" />
                                امنیت و رمز عبور
                            </CardTitle>
                            <CardDescription>
                                رمز عبور خود را تغییر دهید
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">رمز عبور جدید</Label>
                                    <div className="relative">
                                        <Lock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="pr-10 bg-white/50 dark:bg-slate-950/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">تکرار رمز عبور جدید</Label>
                                    <div className="relative">
                                        <Lock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="pr-10 bg-white/50 dark:bg-slate-950/50"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" variant="destructive" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Lock className="w-4 h-4 ml-2" />}
                                        تغییر رمز عبور
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
