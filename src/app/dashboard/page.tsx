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
      const projectsRes = await fetch('http://127.0.0.1:8000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!projectsRes.ok) throw new Error('خطا در دریافت پروژه‌ها')
      const projectsList = await projectsRes.json()

      // ✅ دریافت تسک‌های همه پروژه‌ها
      let allTasks: any[] = []
      for (const project of projectsList) {
        try {
          const tasksRes = await fetch(
            `http://127.0.0.1:8000/api/projects/${project.id}/tasks`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          )

          if (tasksRes.ok) {
            const projectTasks = await tasksRes.json()
            allTasks = [
              ...allTasks,
              ...projectTasks.map((t: any) => ({
                ...t,
                projectId: project.id,
                projectName: project.name,
              })),
            ]
          }
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
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Welcome Card - ریسپانسیو */}
        <div className="rounded-xl p-4 sm:p-6 text-white relative overflow-hidden bg-gradient-to-l from-[oklch(0.6_0.2_240)] to-[oklch(0.5_0.2_240)] dark:from-[oklch(0.55_0.18_255)] dark:to-[oklch(0.45_0.18_255)]">
          <div className="relative z-10">
            <div className="max-w-xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">سلام {user.name}!</h2>
              <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">به داشبورد خود خوش آمدید</p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="h-9 sm:h-10 bg-white/20 hover:bg-white/30 text-white border-white/20 cursor-pointer text-sm"
                  onClick={() => router.push('/tasks')}
                >
                  مشاهده تسک‌ها
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute left-0 top-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute right-0 bottom-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Stats Grid - ریسپانسیو */}
        <div className="mb-4 sm:mb-6">
          <StatsGrid stats={stats} />
        </div>

        {/* Charts Section - ریسپانسیو */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <WeeklyChart data={weeklyData} />
          </div>
          <div className="w-full">
            <SprintProgress sprint={sprint} />
          </div>
        </div>

        {/* Tasks and Activity Section - ریسپانسیو */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TaskList tasks={tasks} />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </DashboardLayout>
  )
}