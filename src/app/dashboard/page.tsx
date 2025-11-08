'use client'

import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
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

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      redirect('/auth/login')
    }

    fetchDashboardData(token)
  }, [])

  const fetchDashboardData = async (token: string) => {
    try {
      // داده‌های نمونه موقت تا زمانی که API آماده شود
      const mockData = {
        stats: {
          myTasks: 12,
          completedToday: 5,
          inProgress: 3,
          completionRate: 75
        },
        tasks: [
          { 
            id: "1", 
            title: "طراحی صفحه داشبورد", 
            status: "completed" as "completed", 
            dueDate: "2025-11-05",
            priority: "high" as "high",
            progress: 100,
            assigneeId: "1"
          },
          { 
            id: "2", 
            title: "پیاده‌سازی احراز هویت", 
            status: "in-progress" as "in-progress", 
            dueDate: "2025-11-07",
            priority: "medium" as "medium",
            progress: 60,
            assigneeId: "1"
          },
          { 
            id: "3", 
            title: "بهینه‌سازی عملکرد", 
            status: "todo" as "todo", 
            dueDate: "2025-11-10",
            priority: "low" as "low",
            progress: 0,
            assigneeId: "1"
          }
        ],
        activities: [
          { 
            id: "1", 
            type: "task_completed", 
            description: "تسک طراحی صفحه داشبورد تکمیل شد", 
            timestamp: "2025-11-03T10:30:00",
            userId: "1",
            userName: "کاربر",
            action: "completed"
          },
          { 
            id: "2", 
            type: "comment_added", 
            description: "نظر جدید در تسک پیاده‌سازی احراز هویت", 
            timestamp: "2025-11-03T09:15:00",
            userId: "1",
            userName: "کاربر",
            action: "commented"
          }
        ],
        sprint: {
          id: "1",
          name: "Sprint 1",
          startDate: "2025-11-01",
          endDate: "2025-11-15",
          progress: 45,
          totalTasks: 10,
          completedTasks: 4
        },
        weeklyData: [
          { day: "شنبه", tasks: 5, completed: 3, inProgress: 1, total: 9 },
          { day: "یکشنبه", tasks: 4, completed: 4, inProgress: 0, total: 8 },
          { day: "دوشنبه", tasks: 6, completed: 5, inProgress: 1, total: 12 },
          { day: "سه‌شنبه", tasks: 3, completed: 2, inProgress: 1, total: 6 },
          { day: "چهارشنبه", tasks: 5, completed: 3, inProgress: 2, total: 10 },
          { day: "پنج‌شنبه", tasks: 4, completed: 4, inProgress: 0, total: 8 },
          { day: "جمعه", tasks: 2, completed: 1, inProgress: 1, total: 4 }
        ]
      };

      // استفاده از داده‌های نمونه
      setStats(mockData.stats);
      setTasks(mockData.tasks);
      setActivities(mockData.activities);
      setSprint(mockData.sprint);
      setWeeklyData(mockData.weeklyData);

    } catch (error) {
      console.error('خطا در دریافت داده‌ها:', error)
      // اگر API نیست، فعلاً خالی بذار
      setStats({ myTasks: 0, completedToday: 0, inProgress: 0, completionRate: 0 })
      setTasks([])
      setActivities([])
      setSprint(null)
      setWeeklyData([])
    } finally {
      setIsLoading(false)
    }
  }

  const user = {
    id: localStorage.getItem('user_id') || '', 
    name: localStorage.getItem('user_name') || 'کاربر',
    email: localStorage.getItem('user_email') || ''
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Card */}
        <div className="rounded-xl p-6 text-white relative overflow-hidden bg-gradient-to-br from-[oklch(0.6_0.2_240)] to-[oklch(0.5_0.2_240)]">
          <div className="relative z-10">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold mb-2">سلام {user.name}! </h2>
              <p className="text-blue-100 mb-6">به داشبورد خود خوش آمدید</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" className="h-10">
                  مشاهده وظایف
                </Button>
                <Button variant="outline" className="h-10 bg-white/20 hover:bg-white/30 text-white border-white/20">
                  تسک جدید
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute left-0 top-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Stats Grid */}
        <div className="mb-6">
          <StatsGrid stats={stats} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <WeeklyChart data={weeklyData} />
          </div>
          <div className="w-full">
            <SprintProgress sprint={sprint} />
          </div>
        </div>

        {/* Tasks and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TaskList tasks={tasks} />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </DashboardLayout>
  )
}