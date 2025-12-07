'use client'

import { useEffect, useState } from 'react'
import { redirect, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsGrid from '@/components/dashboard/StatsGrid'
import TaskList from '@/components/dashboard/TaskList'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import SprintProgress from '@/components/dashboard/SprintProgress'
import WeeklyChart from '@/components/dashboard/WeeklyChart'
import { Button } from '@/components/ui/button'
import { Stats, Task, Activity, Sprint, WeeklyData } from '@/types'
import { api } from '@/lib/api-client'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyData[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const [user, setUser] = useState({
    id: '',
    name: 'کاربر',
    email: ''
  })

  const fetchDashboardData = async (token: string) => {
    try {
      setIsLoading(true)

      // ✅ دریافت پروژه‌ها
      const projectsList = await api.projects.list(token)

      // ✅ دریافت تسک‌های همه پروژه‌ها
      let allTasks: any[] = []
      for (const project of projectsList) {
        try {
          const projectTasks = await api.projects.getTasks(project.id, token)
          allTasks = [
            ...allTasks,
            ...projectTasks.map((t: any) => ({
              ...t,
              projectId: project.id,
              projectName: project.name,
            })),
          ]
        } catch (err) {
          console.error(`خطا در دریافت تسک‌های پروژه ${project.id}:`, err)
        }
      }

      // ✅ محاسبه آمار
      const today = new Date().toISOString().split('T')[0]
      const completedToday = allTasks.filter(t =>
        t.status === 'done' &&
        t.updated_at?.startsWith(today)
      ).length

      const inProgress = allTasks.filter(t => t.status === 'in_progress').length
      const completed = allTasks.filter(t => t.status === 'done').length
      const completionRate = allTasks.length > 0
        ? Math.round((completed / allTasks.length) * 100)
        : 0

      setStats({
        myTasks: allTasks.length,
        completedToday,
        inProgress,
        completionRate
      })

      // ✅ تبدیل تسک‌ها به فرمت مورد نیاز
      const formattedTasks = allTasks.slice(0, 5).map(t => ({
        id: String(t.id),
        title: t.title,
        status: t.status === 'done' ? 'completed' as const :
          t.status === 'in_progress' ? 'in-progress' as const :
            'todo' as const,
        dueDate: t.due_date || '',
        priority: t.priority || 'medium' as const,
        progress: t.status === 'done' ? 100 :
          t.status === 'in_progress' ? 50 : 0,
        assigneeId: String(t.assignee_id || '1')
      }))
      setTasks(formattedTasks)

      // ✅ فعالیت‌های اخیر (از تسک‌ها استخراج می‌کنیم)
      const recentActivities = allTasks
        .filter(t => t.updated_at)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)
        .map(t => ({
          id: String(t.id),
          type: 'task_completed' as const,
          description: `تسک "${t.title}" ${t.status === 'done' ? 'تکمیل شد' : 'به‌روزرسانی شد'}`,
          timestamp: t.updated_at,
          userId: String(t.assignee_id || '1'),
          userName: 'کاربر',
          action: t.status === 'done' ? 'completed' as const : 'commented' as const
        }))
      setActivities(recentActivities)

      // ✅ اطلاعات اسپرینت (فرضی - بعداً از API بگیرید)
      const sprintTasks = allTasks.filter(t => t.status !== 'blocked')
      setSprint({
        id: "1",
        name: "Sprint فعلی",
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: sprintTasks.length > 0
          ? Math.round((sprintTasks.filter(t => t.status === 'done').length / sprintTasks.length) * 100)
          : 0,
        totalTasks: sprintTasks.length,
        completedTasks: sprintTasks.filter(t => t.status === 'done').length
      })

      // ✅ داده‌های هفتگی
      const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']
      const weekly = weekDays.map(day => {
        const dayTasks = Math.floor(Math.random() * 8) + 2 // موقتی رندم
        const dayCompleted = Math.floor(Math.random() * dayTasks)
        return {
          day,
          tasks: dayTasks,
          completed: dayCompleted,
          inProgress: dayTasks - dayCompleted,
          total: dayTasks
        }
      })
      setWeeklyData(weekly)

    } catch (error) {
      console.error('خطا در دریافت داده‌ها:', error)
      // در صورت خطا، مقادیر خالی قرار بده
      setStats({ myTasks: 0, completedToday: 0, inProgress: 0, completionRate: 0 })
      setTasks([])
      setActivities([])
      setSprint(null)
      setWeeklyData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')

    if (typeof window !== 'undefined') {
      setUser({
        id: localStorage.getItem('user_id') || '',
        name: localStorage.getItem('user_name') || 'کاربر',
        email: localStorage.getItem('user_email') || ''
      })
    }

    if (!token) {
      redirect('/auth/login')
    }

    fetchDashboardData(token)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 max-w-7xl mx-auto">
        {/* Welcome Card - ریسپانسیو */}
        <div className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 shadow-xl">
          <div className="relative z-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">سلام {user.name}! 👋</h2>
              <p className="text-blue-100 mb-6 sm:mb-8 text-base sm:text-lg">به داشبورد خود خوش آمدید. امروز چه کاری می‌خواهید انجام دهید؟</p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Button
                  variant="secondary"
                  className="h-10 sm:h-11 px-6 bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-sm"
                  onClick={() => router.push('/tasks')}
                >
                  مشاهده تسک‌ها
                </Button>
                <Button
                  variant="outline"
                  className="h-10 sm:h-11 px-6 bg-blue-700/30 text-white border-white/20 hover:bg-blue-700/50 backdrop-blur-sm font-medium"
                  onClick={() => router.push('/projects')}
                >
                  مدیریت پروژه‌ها
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute left-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-indigo-500/30 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />
        </div>

        {/* Stats Grid - ریسپانسیو */}
        <div className="mb-6 sm:mb-8">
          <StatsGrid stats={stats} />
        </div>

        {/* Charts Section - ریسپانسیو */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <div className="xl:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <WeeklyChart data={weeklyData} />
          </div>
          <div className="w-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <SprintProgress sprint={sprint} />
          </div>
        </div>

        {/* Tasks and Activity Section - ریسپانسیو */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <TaskList tasks={tasks} />
          </div>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}