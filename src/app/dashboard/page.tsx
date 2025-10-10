'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsGrid from '@/components/dashboard/StatsGrid';
import TaskList from '@/components/dashboard/TaskList';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import SprintProgress from '@/components/dashboard/SprintProgress';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import { Button } from '@/components/ui/button';
import { Stats, Task, Activity, Sprint, WeeklyData } from '@/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[] | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    }

    // in this situation call fetchDashboardData to reload the dashboard's data
    if (status === 'authenticated') {
      fetchDashboardData();
    }
    //status is a dependence and any time it change, (like login to authenticated) the code inside useEffect execute again
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      // API calls - بعداً uncomment می‌کنی
      // const [statsRes, tasksRes, activitiesRes, sprintRes, weeklyRes] = await Promise.all([
      //   fetch('/api/dashboard/stats'),
      //   fetch('/api/tasks/my-tasks'),
      //   fetch('/api/activities/recent'),
      //   fetch('/api/sprints/current'),
      //   fetch('/api/dashboard/weekly')
      // ]);

      // setStats(await statsRes.json());
      // setTasks(await tasksRes.json());
      // setActivities(await activitiesRes.json());
      // setSprint(await sprintRes.json());
      // setWeeklyData(await weeklyRes.json());

      // فعلاً خالی
      setTimeout(() => {
        setStats({ myTasks: 0, completedToday: 0, inProgress: 0, completionRate: 0 });
        setTasks([]);
        setActivities([]);
        setSprint(null);
        setWeeklyData([]);
      }, 500);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  //if the user is in loading or there is no session (like the user isn't authenticate yet), show a loader
  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl p-8 text-white relative overflow-hidden bg-gradient-to-br from-[oklch(0.6_0.2_240)] to-[oklch(0.5_0.2_240)]">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">
              سلام {session.user?.name}! 👋
            </h2>
            <p className="text-blue-100 mb-6">
              به داشبورد خود خوش آمدید
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Button variant="secondary" size="lg">
                مشاهده وظایف
              </Button>
              <Button variant="outline" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                ایجاد تسک جدید
              </Button>
            </div>
          </div>
          <div className="absolute left-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SprintProgress sprint={sprint} />
          <div className="lg:col-span-2">
            <WeeklyChart data={weeklyData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskList tasks={tasks} />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </DashboardLayout>
  );
}