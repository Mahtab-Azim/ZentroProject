'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Calendar,
    CheckCircle2,
    Clock,
    Layout,
    ArrowRight,
    ChevronLeft,
    Activity,
    Target,
    BarChart3
} from 'lucide-react'
import { api } from '@/lib/api-client'
import { AuthBackground } from "@/components/auth/AuthBackground"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprint, Task } from '@/types'

export const SprintInterface = () => {
    const router = useRouter()
    const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)
    const [sprintTasks, setSprintTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (!token) {
            router.push('/auth/login')
            return
        }
        fetchSprintData(token)
    }, [])

    const fetchSprintData = async (token: string) => {
        try {
            setIsLoading(true)
            // For now, we fetch projects and pick the first sprint of the first project as "active" 
            // since there isn't a dedicated "get active sprint" endpoint yet in the client.
            const projects = await api.projects.list(token)

            if (projects && projects.length > 0) {
                const project = projects[0]
                if (project.sprints && project.sprints.length > 0) {
                    const sprint = project.sprints[0]
                    setActiveSprint(sprint)

                    // Fetch tasks for this project
                    const tasks = await api.projects.getTasks(project.id, token)
                    // In a real app, we'd filter tasks by sprintId if available
                    // For now, showing all project tasks as part of the sprint context
                    setSprintTasks(tasks)
                }
            }
        } catch (err: any) {
            setError(err.message || 'خطا در دریافت اطلاعات اسپرینت')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative z-0 flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <AuthBackground />

            <div className="max-w-7xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-white/10 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600/10 p-3 rounded-2xl">
                            <Target className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">جزئیات اسپرینت</h1>
                            <p className="text-muted-foreground">{activeSprint?.name || 'اسپرینت یافت نشد'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/50 hover:bg-background transition-colors border border-border"
                    >
                        <ArrowRight className="w-4 h-4" />
                        <span>بازگشت</span>
                    </button>
                </div>

                {!activeSprint ? (
                    <div className="text-center py-20 bg-white/20 dark:bg-slate-900/20 rounded-3xl backdrop-blur-sm border border-dashed border-border">
                        <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-medium text-foreground">اسپرینت فعالی یافت نشد</h2>
                        <p className="text-muted-foreground mt-2">ابتدا یک اسپرینت در بخش پروژه‌ها ایجاد کنید.</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg rounded-3xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        بازه زمانی
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold flex items-center gap-2">
                                        <span>{activeSprint.startDate}</span>
                                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                                        <span>{activeSprint.endDate}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">مدت زمان اسپرینت</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg rounded-3xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4" />
                                        پیشرفت کلی
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-2xl font-bold">{activeSprint.progress}%</span>
                                        <span className="text-xs text-muted-foreground">{activeSprint.completedTasks} از {activeSprint.totalTasks} تسک</span>
                                    </div>
                                    <Progress value={activeSprint.progress} className="h-2" />
                                </CardContent>
                            </Card>

                            <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg rounded-3xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        وضعیت تسک‌ها
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-green-500/10 p-3 rounded-2xl">
                                            <p className="text-2xl font-bold text-green-600">{activeSprint.completedTasks}</p>
                                            <p className="text-xs text-green-600/80">انجام شده</p>
                                        </div>
                                        <div className="bg-blue-500/10 p-3 rounded-2xl">
                                            <p className="text-2xl font-bold text-blue-600">{activeSprint.totalTasks - activeSprint.completedTasks}</p>
                                            <p className="text-xs text-blue-600/80">در جریان</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tasks Section */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-foreground px-2">لیست تسک‌های اسپرینت</h3>
                            <div className="grid gap-4">
                                {sprintTasks.length === 0 ? (
                                    <div className="text-center py-10 bg-white/10 dark:bg-slate-900/10 rounded-3xl border border-dashed border-border">
                                        <p className="text-muted-foreground">تکس‌های این اسپرینت یافت نشد.</p>
                                    </div>
                                ) : (
                                    sprintTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-md flex items-center justify-between group hover:shadow-lg transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-10 rounded-full ${task.status === 'completed' ? 'bg-green-500' :
                                                        task.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-400'
                                                    }`} />
                                                <div>
                                                    <h4 className="font-bold text-foreground">{task.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1 underline-offset-4 decoration-dotted">
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {task.dueDate || 'بدون تاریخ'}
                                                        </span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                                                            task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                                                            }`}>
                                                            {task.priority === 'high' ? 'فوری' : task.priority === 'medium' ? 'متوسط' : 'کم'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs px-3 py-1 rounded-full border ${task.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-600' :
                                                        task.status === 'in-progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                                                            'bg-slate-500/10 border-slate-500/20 text-slate-600'
                                                    }`}>
                                                    {task.status === 'completed' ? 'تکمیل شده' : task.status === 'in-progress' ? 'در حال انجام' : 'در لیست'}
                                                </span>
                                                <button
                                                    onClick={() => router.push('/tasks')}
                                                    className="p-2 rounded-xl bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background border border-border"
                                                >
                                                    <Layout className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
