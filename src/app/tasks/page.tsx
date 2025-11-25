'use client'

import React, { useEffect, useState } from 'react'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from "@dnd-kit/core"
// import { toast } from '@/components/ui/use-toast'
import { Plus, Trash2, X, AlertCircle, Send, Maximize2, Minimize2 } from 'lucide-react'

interface Task {
  id: number
  title: string
  description?: string
  status: "draft" | "todo" | "in_progress" | "in_review" | "done" | "blocked"
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  projectId: number
  projectName: string
}

interface Project {
  id: number
  name: string
}

interface NewTask {
  title: string
  description?: string
  status: Task['status']
  priority: Task['priority']
  due_date?: string
  project_id: number
}

const SortableTaskItem = ({ task, onDelete }: { task: Task; onDelete: (id: number) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityColor = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  }

  const priorityLabel = { high: 'زیاد', medium: 'متوسط', low: 'کم' }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card text-card-foreground rounded-xl p-5 border border-border border-l-4 shadow-sm hover:shadow-lg transition-all cursor-grab active:cursor-grabbing ${priorityColor[task.priority]}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <h4 className="font-bold text-card-foreground">{task.title}</h4>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
              {task.projectName}
            </span>
            <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full">
              اولویت: {priorityLabel[task.priority]}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{task.description}</p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
          className="text-muted-foreground hover:text-destructive p-1 shrink-0"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}

const KanbanColumn = ({
  title,
  status,
  tasks,
  onDelete,
}: {
  title: string
  status: Task['status']
  tasks: Task[]
  onDelete: (id: number) => void
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-80 bg-muted/40 rounded-2xl p-5 flex flex-col border-2 transition-all ${isOver ? 'border-primary bg-primary/10' : 'border-border'
        }`}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-foreground text-lg">{title}</h3>
        <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 min-h-96">
        <SortableContext items={tasks.map(t => t.id)}>
          {tasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">
              هنوز تسکی اضافه نشده
            </p>
          ) : (
            tasks.map(task => (
              <SortableTaskItem
                key={task.id}
                task={task}
                onDelete={onDelete}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ type: 'user' | 'agent'; text: string }[]>([])
  const [chatInput, setChatInput] = useState('')

  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    project_id: 0,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      window.location.href = '/auth/login'
      return
    }
    fetchTasks(token)
  }, [])

  const fetchTasks = async (token: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const projectsRes = await fetch('http://127.0.0.1:8000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!projectsRes.ok) throw new Error('خطا در دریافت پروژه‌ها')

      const projectsList = (await projectsRes.json()) as Project[]
      setProjects(projectsList)

      let allTasks: Task[] = []

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

      setTasks(allTasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = async () => {
    const token = localStorage.getItem('access_token')
    if (!token || !newTask.project_id || !newTask.title) return

    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      })

      if (!response.ok) throw new Error('خطا در ایجاد تسک')

      await fetchTasks(token)
      setIsAddModalOpen(false)
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        project_id: 0,
      })
    } catch (err) {
      setError('خطا در ایجاد تسک جدید')
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('خطا در حذف تسک')

      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      setError('خطا در حذف تسک')
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    const newStatus = over.id as Task['status']
    if (activeTask.status === newStatus) return

    const token = localStorage.getItem('access_token')

    if (!token) {
      setError('لطفاً دوباره وارد شوید')
      setTimeout(() => window.location.href = '/auth/login', 1500)
      return
    }

    try {
      // 🎯 فقط فیلدهایی که حتماً لازمه رو بفرست
      const payload: any = {
        status: newStatus,
      }

      // اگه backend حتماً این فیلدها رو می‌خواد
      if (activeTask.projectId) payload.project_id = activeTask.projectId
      if (activeTask.title) payload.title = activeTask.title

      console.log('📤 Payload:', JSON.stringify(payload, null, 2))

      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/tasks/${activeTask.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (response.status === 401) {
        setError('نشست منقضی شده')
        localStorage.removeItem('access_token')
        setTimeout(() => window.location.href = '/auth/login', 2000)
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ خطای کامل:', JSON.stringify(errorData, null, 2))
        setError(`خطا: ${errorData.detail?.[0]?.msg || JSON.stringify(errorData)}`)
        return
      }

      console.log('✅ موفق!')

      // موفقیت
      setTasks(prev =>
        prev.map(t =>
          t.id === activeTask.id
            ? { ...t, status: newStatus }
            : t
        )
      )
    } catch (err) {
      console.error('خطا:', err)
      setError('خطا در ارتباط با سرور')
    }
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { type: 'user', text: chatInput }])
    setChatInput('')
    setTimeout(() => {
      setChatMessages(prev => [...prev, { type: 'agent', text: 'سلام! API من هنوز آماده نیست!' }])
    }, 800)
  }

  const todoTasks = tasks.filter(t => t.status === 'todo')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const reviewTasks = tasks.filter(t => t.status === 'in_review')
  const doneTasks = tasks.filter(t => t.status === 'done')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex transition-colors duration-300">
      {/* Kanban Section */}
      {!isFullscreen && (
        <div className={`flex-1 px-6 pt-24 pb-8 overflow-auto ${!isFullscreen ? 'lg:mr-96' : ''}`}>
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground">تسک های من</h1>
              <p className="text-muted-foreground mt-2">مدیریت تسک‌های خود</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 hover:bg-blue-700 shadow-xl transition-all cursor-pointer font-semibold"
            >
              <Plus size={24} />
              تسک جدید
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 mb-8 text-destructive flex gap-3">
              <AlertCircle size={24} />
              <span>{error}</span>
            </div>
          )}

          {/* مودال اضافه کردن تسک */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-card text-card-foreground border border-border rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-card-foreground">افزودن تسک جدید</h2>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={28} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان تسک</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder="مثلاً: طراحی صفحه لاگین"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">توضیحات</label>
                    <textarea
                      value={newTask.description}
                      onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder="جزئیات تسک رو بنویس..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">پروژه</label>
                    <select
                      value={newTask.project_id}
                      onChange={e => setNewTask({ ...newTask, project_id: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/60"
                    >
                      <option value={0}>انتخاب پروژه</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">وضعیت</label>
                      <select
                        value={newTask.status}
                        onChange={e => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                        className="w-full px-5 py-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/60"
                      >
                        <option value="todo">آماده انجام</option>
                        <option value="in_progress">در حال انجام</option>
                        <option value="review">بررسی/تست</option>
                        <option value="done">انجام‌شده</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">اولویت</label>
                      <select
                        value={newTask.priority}
                        onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                        className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/60"
                      >
                        <option value="low">کم</option>
                        <option value="medium">متوسط</option>
                        <option value="high">زیاد</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-6 py-3 text-muted-foreground hover:text-foreground font-semibold rounded-lg hover:bg-muted"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleAddTask}
                      disabled={!newTask.title || !newTask.project_id}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-lg cursor-pointer transition-all"
                    >
                      ایجاد تسک
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 overflow-x-auto pb-8">
              <KanbanColumn
                title="آماده انجام"
                status="todo"
                tasks={todoTasks}
                onDelete={handleDeleteTask}
              />
              <KanbanColumn
                title="در حال انجام"
                status="in_progress"
                tasks={inProgressTasks}
                onDelete={handleDeleteTask}
              />
              <KanbanColumn
                title="بررسی/تست"
                status="in_review"
                tasks={reviewTasks}
                onDelete={handleDeleteTask}
              />
              <KanbanColumn
                title="انجام‌شده"
                status="done"
                tasks={doneTasks}
                onDelete={handleDeleteTask}
              />
            </div>
          </DndContext>
        </div>
      )}

      {/* Chat Sidebar */}
      <div className={`fixed ${isFullscreen ? 'inset-0 z-50' : 'right-0 top-24 bottom-0 w-96 z-50'} bg-card ${isFullscreen ? '' : 'border-l-2 border-border'} shadow-2xl flex flex-col transition-all duration-300 rounded-l-3xl overflow-hidden`}>
        {/* Header (softer top corners and subtle shadow) */}
        <div className={`bg-linear-to-r from-blue-500 via-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between ${isFullscreen ? 'rounded-none' : 'rounded-t-3xl'} shadow-md backdrop-blur-sm`}>
          <h3 className="font-bold text-lg">AI Chat Interface</h3>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-card/50">
          {chatMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-center text-gray-500 text-sm">پیام جدید نوشته نشده</p>
            </div>
          ) : (
            chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-2xl text-sm ${msg.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted text-muted-foreground'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* persistent chat (no draggable handle) */}

        {/* Input */}
        <div className="p-4 border-t-2 border-border bg-muted/40">
          <div className="flex gap-2 items-center flex-row-reverse">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="پیام خود را بنویسید..."
              className="flex-1 px-4 py-2 border-2 border-blue-400 rounded-2xl focus:outline-none focus:ring-0 text-sm text-right bg-background text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* chat is persistent; no reopen button */}
    </div>
  )
}