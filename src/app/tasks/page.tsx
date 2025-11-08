"use client"

import React, { useEffect, useState } from 'react'
import { Clock, CheckCircle, AlertCircle, Plus, Filter } from 'lucide-react'

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  projectId: number;
  projectName: string;
}

interface Project {
  id: number;
  name: string;
}

interface NewTask {
  title: string;
  description?: string;
  status: Task['status'];
  priority: Task['priority'];
  due_date?: string;
  project_id: number;
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | Task['status']>('all')
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    project_id: 0
  })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setIsAuthenticated(false)
      window.location.href = '/auth/login'
      return
    }
    
    fetchTasks(token)
  }, [])

  const fetchTasks = async (token: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Get all projects first
      const projectsRes = await fetch('http://127.0.0.1:8000/api/projects/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!projectsRes.ok) {
        throw new Error('خطا در دریافت پروژه‌ها')
      }

      const projectsList = await projectsRes.json() as Project[]
      setProjects(projectsList)
      let allTasks: Task[] = []

      // Fetch tasks from each project
      for (const project of projects) {
        try {
          const tasksRes = await fetch(`http://127.0.0.1:8000/api/projects/projects/${project.id}/tasks`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (tasksRes.ok) {
            const projectTasks = await tasksRes.json() as Omit<Task, 'projectId' | 'projectName'>[]
            allTasks = [...allTasks, ...projectTasks.map(t => ({ 
              ...t, 
              projectId: project.id, 
              projectName: project.name 
            }))]
          }
        } catch (err) {
          console.error(`خطا در دریافت تسک‌های پروژه ${project.id}:`, err)
        }
      }

      setTasks(allTasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد')
      console.error('خطا:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'blocked':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch(priority) {
      case 'high':
        return 'border-l-4 border-l-red-500'
      case 'medium':
        return 'border-l-4 border-l-yellow-500'
      case 'low':
        return 'border-l-4 border-l-green-500'
      default:
        return 'border-l-4 border-l-gray-300'
    }
  }

  const handleAddTask = async () => {
    const token = localStorage.getItem('access_token')
    if (!token || !newTask.project_id) return

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      })

      if (!response.ok) {
        throw new Error('خطا در ایجاد تسک جدید')
      }

      // بروزرسانی لیست تسک‌ها
      await fetchTasks(token)
      
      // بستن مودال و ریست کردن فرم
      setIsAddModalOpen(false)
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
        project_id: 0
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد تسک')
    }
  }

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus)

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>درحال انتقال به صفحه ورود...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">وظایف من</h1>
            <p className="text-gray-600">مدیریت و پیگیری تسک‌های خود</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            تسک جدید
          </button>
        </div>

        {/* Add Task Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">افزودن تسک جدید</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="عنوان تسک را وارد کنید"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="توضیحات تسک را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">پروژه</label>
                  <select
                    value={newTask.project_id}
                    onChange={(e) => setNewTask({...newTask, project_id: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>انتخاب پروژه</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value as Task['status']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">در انتظار</option>
                    <option value="in_progress">در حال انجام</option>
                    <option value="completed">تکمیل شده</option>
                    <option value="blocked">مسدود شده</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اولویت</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">کم</option>
                    <option value="medium">متوسط</option>
                    <option value="high">زیاد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ سررسید</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={!newTask.title || !newTask.project_id}
                  >
                    ایجاد تسک
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">کل تسک‌ها</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <CheckCircle size={16} className="text-green-600" />
              تکمیل شده
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Clock size={16} className="text-blue-600" />
              در حال انجام
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <AlertCircle size={16} className="text-yellow-600" />
              منتظر
            </div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <Filter size={20} className="text-gray-600" />
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'in_progress', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'همه' : status === 'pending' ? 'منتظر' : status === 'in_progress' ? 'در حال انجام' : 'تکمیل شده'}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            {error}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">تسکی برای نمایش وجود ندارد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div 
                key={task.id} 
                className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer shadow-sm ${getPriorityColor(task.priority)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="bg-gray-100 px-3 py-1 rounded">📌 {task.projectName}</span>
                      <span className={`px-3 py-1 rounded font-medium ${getStatusColor(task.status)}`}>
                        {task.status === 'completed' ? 'تکمیل شده' : task.status === 'in_progress' ? 'در حال انجام' : task.status === 'pending' ? 'منتظر' : 'مسدود'}
                      </span>
                      {task.due_date && <span>📅 {task.due_date}</span>}
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 text-right max-w-xs">{task.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}