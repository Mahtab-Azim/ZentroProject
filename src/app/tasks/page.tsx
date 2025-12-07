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
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import { Plus, Trash2, X, AlertCircle, Send, Maximize2, Minimize2, MessageSquare, ChevronRight, CheckCircle2, Edit2 } from 'lucide-react'
import { CustomSelect } from '@/components/ui/custom-select'
import { api } from '@/lib/api-client'

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

const SortableTaskItem = ({ task, onDelete, onEdit }: { task: Task; onDelete: (id: number) => void; onEdit: (task: Task) => void }) => {
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
        <div className="flex flex-col gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task) }}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-blue-500 p-1 shrink-0"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
            onPointerDown={(e) => e.stopPropagation()} // Fix: Stop propagation to prevent drag start
            className="text-muted-foreground hover:text-destructive p-1 shrink-0"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

const KanbanColumn = ({
  title,
  status,
  tasks,
  onDelete,
  onEdit,
}: {
  title: string
  status: Task['status']
  tasks: Task[]
  onDelete: (id: number) => void
  onEdit: (task: Task) => void
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`w-full bg-muted/40 rounded-2xl p-4 sm:p-5 flex flex-col border-2 transition-all ${isOver ? 'border-primary bg-primary/10' : 'border-border'
        }`}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-foreground text-lg">{title}</h3>
        <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 min-h-[300px] max-h-[600px]">
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
                onEdit={onEdit}
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
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ type: 'user' | 'agent'; text: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [selectedDate, setSelectedDate] = useState<any>(null)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [chats, setChats] = useState<{ thread_id: string; title: string }[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAgentLoading, setIsAgentLoading] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)

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
    const userName = localStorage.getItem('user_name')
    const userEmail = localStorage.getItem('user_email')

    if (userName && userEmail) {
      setUser({ name: userName, email: userEmail })
    }

    if (!token) {
      window.location.href = '/auth/login'
      return
    }
    fetchTasks(token)
    fetchChats(token)

    // Open chat by default on desktop
    if (window.innerWidth >= 1024) {
      setIsChatOpen(true)
    }
  }, [])

  const fetchChats = async (token: string) => {
    try {
      const data = await api.agent.getChats(token)
      setChats(data)
    } catch (err) {
      console.error('Error fetching chats:', err)
    }
  }

  const fetchChatHistory = async (threadId: string) => {
    const token = localStorage.getItem('access_token')
    if (!token) return 

    try {
      setIsAgentLoading(true)
      const data = await api.agent.getHistory(threadId, token)
      // Map history to chat format (adjust based on actual API response)
      const history = data.map((msg: any) => ({
        type: (msg.role === 'user' ? 'user' : 'agent') as 'user' | 'agent',
        text: msg.content
      }))
      setChatMessages(history)
      setCurrentChatId(threadId)
    } catch (err) {
      console.error('Error fetching history:', err)
    } finally {
      setIsAgentLoading(false)
    }
  }

  const handleNewChat = () => {
    setChatMessages([])
    setCurrentChatId(null)
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const token = localStorage.getItem('access_token')
    if (!token) return

    const userMsg = { type: 'user' as const, text: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsAgentLoading(true)

    try {
      const data = await api.agent.sendMessage({
        prompt: chatInput,
        thread_id: currentChatId
      }, token)

      const agentMsg = { type: 'agent' as const, text: data.message || 'پاسخی دریافت نشد.' } // Adjust based on API
      setChatMessages(prev => [...prev, agentMsg])

      // Refresh chats list if it was a new chat
      if (!currentChatId) {
        fetchChats(token)
        if (data.thread_id) setCurrentChatId(data.thread_id)
      }
    } catch (err) {
      console.error('Agent Error:', err)
      setChatMessages(prev => [...prev, { type: 'agent', text: 'خطا در برقراری ارتباط با هوش مصنوعی.' }])
    } finally {
      setIsAgentLoading(false)
    }
  }

  const fetchTasks = async (token: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const projectsList = await api.projects.list(token)
      setProjects(projectsList)

      let allTasks: Task[] = []

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

      setTasks(allTasks)
    } catch (err) {
      setError(err instanceof Error ? (err as any).message || 'خطایی رخ داد' : 'خطایی رخ داد')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = async () => {
    const token = localStorage.getItem('access_token')
    if (!token || !newTask.project_id || !newTask.title) return

    try {
      if (editingTaskId) {
        // Update existing task
        await api.tasks.update(editingTaskId, newTask, token)

        // Update local state
        setTasks(prev => prev.map(t =>
          t.id === editingTaskId
            ? { ...t, ...newTask, projectId: newTask.project_id, projectName: projects.find(p => p.id === newTask.project_id)?.name || '' }
            : t
        ))
      } else {
        // Create new task
        await api.tasks.create(newTask, token)
        await fetchTasks(token)
      }

      setIsAddModalOpen(false)
      setEditingTaskId(null)
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        project_id: 0,
      })
    } catch (err) {
      setError(editingTaskId ? 'خطا در ویرایش تسک' : 'خطا در ایجاد تسک جدید')
    }
  }

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id)
    setNewTask({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || '',
      project_id: task.projectId,
    })
    if (task.due_date) {
      setSelectedDate(new Date(task.due_date))
    } else {
      setSelectedDate(null)
    }
    setIsAddModalOpen(true)
  }

  const openAddModal = () => {
    setEditingTaskId(null)
    setNewTask({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      project_id: 0,
    })
    setSelectedDate(null)
    setIsAddModalOpen(true)
  }

  const handleDeleteTask = async (taskId: number) => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      await api.tasks.delete(taskId, token)
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

    // اگر خود آیتم روی خودش دراپ شد
    if (active.id === over.id) return

    let newStatus = over.id as Task['status']

    // تلاش برای پیدا کردن تسکی که روی آن دراپ شده (با تبدیل به رشته برای اطمینان)
    const overTask = tasks.find(t => String(t.id) === String(over.id))
    if (overTask) {
      newStatus = overTask.status
    }

    // اعتبارسنجی وضعیت جدید
    const validStatuses = ['draft', 'todo', 'in_progress', 'in_review', 'done', 'blocked']
    if (!validStatuses.includes(newStatus)) {
      // اگر وضعیت معتبر نیست (مثلاً ID تسک است و تسک پیدا نشده)، کاری نکنیم
      console.log('Invalid status, ignoring:', newStatus)
      return
    }

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

      await api.tasks.update(activeTask.id, payload, token)

      console.log('✅ موفق!')

      if (newStatus === 'done') {
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
      }

      // موفقیت
      setTasks(prev =>
        prev.map(t =>
          t.id === activeTask.id
            ? { ...t, status: newStatus }
            : t
        )
      )
    } catch (err: any) {
      console.error('خطا:', err)
      if (err.status === 401) {
        setError('نشست منقضی شده')
        localStorage.removeItem('access_token')
        setTimeout(() => window.location.href = '/auth/login', 2000)
        return
      }
      setError('خطا در ارتباط با سرور')
    }
  }



  const todoTasks = tasks.filter(t => t.status === 'todo')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const reviewTasks = tasks.filter(t => t.status === 'in_review')
  const doneTasks = tasks.filter(t => t.status === 'done')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Kanban Section */}
      {!isFullscreen && (
        <div className={`flex-1 px-3 sm:px-6 pt-24 pb-8 overflow-auto ${!isFullscreen ? 'lg:mr-96' : ''}`}>
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">تسک های من</h1>
              <p className="text-muted-foreground mt-2">مدیریت تسک‌های خود</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => window.location.href = '/projects'}
                className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-400 dark:border-cyan-600 px-4 py-2 rounded-xl hover:from-cyan-500/20 hover:to-blue-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <p className="text-sm font-bold text-foreground">مدیریت پروژه‌ها</p>
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-400 dark:border-blue-600 px-4 py-2 rounded-xl hover:from-blue-500/20 hover:to-blue-600/20 transition-all cursor-pointer"
              >
                <p className="text-xs text-muted-foreground">اسپرینت فعال</p>
                <p className="text-sm font-bold text-foreground">Sprint فعلی • {tasks.length} تسک</p>
              </button>
              <button
                onClick={openAddModal}
                className="bg-blue-600 text-white px-6 py-3 sm:py-4 rounded-2xl flex items-center gap-3 hover:bg-blue-700 shadow-xl transition-all cursor-pointer font-semibold"
              >
                <Plus size={24} />
                تسک جدید
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 mb-8 text-destructive flex gap-3">
              <AlertCircle size={24} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Toast */}
          {showSuccessToast && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">تبریک!</h4>
                  <p className="text-sm text-white/90">تسک با موفقیت انجام شد</p>
                </div>
              </div>
            </div>
          )}

          {/* مودال اضافه کردن تسک */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-card text-card-foreground border border-border rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-card-foreground">{editingTaskId ? 'ویرایش تسک' : 'افزودن تسک جدید'}</h2>
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
                    <CustomSelect
                      value={newTask.project_id}
                      onChange={(val) => setNewTask({ ...newTask, project_id: Number(val) })}
                      options={[
                        { value: 0, label: 'انتخاب پروژه' },
                        ...projects.map(p => ({ value: p.id, label: p.name }))
                      ]}
                      placeholder="انتخاب پروژه"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">وضعیت</label>
                      <CustomSelect
                        value={newTask.status}
                        onChange={(val) => setNewTask({ ...newTask, status: val as Task['status'] })}
                        options={[
                          { value: 'todo', label: 'آماده انجام' },
                          { value: 'in_progress', label: 'در حال انجام' },
                          { value: 'review', label: 'بررسی/تست' },
                          { value: 'done', label: 'انجام‌شده' }
                        ]}
                        placeholder="انتخاب وضعیت"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">اولویت</label>
                      <CustomSelect
                        value={newTask.priority}
                        onChange={(val) => setNewTask({ ...newTask, priority: val as Task['priority'] })}
                        options={[
                          { value: 'low', label: 'کم' },
                          { value: 'medium', label: 'متوسط' },
                          { value: 'high', label: 'زیاد' }
                        ]}
                        placeholder="انتخاب اولویت"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">تاریخ سررسید</label>
                    <DatePicker
                      value={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date)
                        if (date) {
                          const gregorianDate = date.toDate()
                          setNewTask({ ...newTask, due_date: gregorianDate.toISOString().split('T')[0] })
                        }
                      }}
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      className="w-full"
                      inputClass="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder="انتخاب تاریخ"
                    />
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
                      {editingTaskId ? 'ذخیره تغییرات' : 'ایجاد تسک'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 pb-8">
              <KanbanColumn
                title="آماده انجام"
                status="todo"
                tasks={todoTasks}
                onDelete={handleDeleteTask}
                onEdit={openEditModal}
              />
              <KanbanColumn
                title="در حال انجام"
                status="in_progress"
                tasks={inProgressTasks}
                onDelete={handleDeleteTask}
                onEdit={openEditModal}
              />
              <KanbanColumn
                title="بررسی/تست"
                status="in_review"
                tasks={reviewTasks}
                onDelete={handleDeleteTask}
                onEdit={openEditModal}
              />
              <KanbanColumn
                title="انجام‌شده"
                status="done"
                tasks={doneTasks}
                onDelete={handleDeleteTask}
                onEdit={openEditModal}
              />
            </div>
          </DndContext>
        </div>
      )}

      {/* Chat Toggle Tab (Right Side) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed top-1/2 right-0 -translate-y-1/2 z-[60] bg-primary text-primary-foreground py-6 px-2 rounded-l-2xl shadow-2xl hover:bg-primary/90 transition-all flex flex-col items-center gap-2 group cursor-pointer"
        >
          <div className="[writing-mode:vertical-rl] rotate-180 text-xs font-bold tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
            AI CHAT
          </div>
          <MessageSquare size={20} />
        </button>
      )}

      {/* Chat Sidebar/Modal */}
      <div className={`fixed transition-all duration-300 bg-background/95 backdrop-blur-sm shadow-2xl flex overflow-hidden
        ${isFullscreen
          ? 'top-24 left-0 right-0 bottom-0 z-40 rounded-none'
          : isChatOpen
            ? 'top-24 bottom-0 right-0 w-96 z-40 rounded-l-3xl border-l border-border'
            : 'top-24 bottom-0 right-[-100%] w-96 z-40'
        }`}>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full relative bg-card/50">
          {/* Header */}
          <div className="bg-card border-b border-border p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
                title="بستن چت"
              >
                <ChevronRight size={20} />
              </button>
              {isFullscreen && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <MessageSquare size={20} className="text-muted-foreground" />
                </button>
              )}
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">دستیار هوشمند</h3>
                <p className="text-xs text-muted-foreground">
                  {isAgentLoading ? 'درحال نوشتن...' : 'آنلاین'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNewChat}
                className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-medium"
              >
                + چت جدید
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-muted-foreground hover:bg-muted p-2 rounded-lg transition-all hidden lg:block"
                title={isFullscreen ? "کوچک کردن" : "تمام صفحه"}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-32">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                  <MessageSquare size={32} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">پیام جدیدی نیست. چیزی بپرسید!</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.type === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-card text-card-foreground border border-border rounded-bl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Floating Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-background via-background/80 to-transparent">
            <div className={`${isFullscreen ? 'max-w-3xl mx-auto' : 'w-full'}`}>
              <div className="bg-card border border-border rounded-3xl shadow-xl p-2 flex items-end gap-2 relative z-10">
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="p-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-1"
                >
                  <Send size={18} className={!chatInput.trim() ? "" : "rtl:rotate-180"} />
                </button>
                <textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 max-h-32 min-h-[44px] py-3 px-4 bg-transparent border-none focus:ring-0 focus:outline-none text-card-foreground placeholder:text-muted-foreground resize-none"
                  rows={1}
                />
              </div>
              {isFullscreen && (
                <p className="text-center text-[10px] text-muted-foreground mt-2">
                  هوش مصنوعی ممکن است اشتباه کند.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Endpoints/History Sidebar (Visible only in Fullscreen - Moved to Left in RTL) */}
        {isFullscreen && isSidebarOpen && (
          <div className="w-64 bg-card border-r border-border hidden md:flex flex-col p-4 shrink-0 transition-all duration-300">
            <div className="mb-6 flex-1 overflow-y-auto">
              <h4 className="font-bold text-card-foreground mb-4 px-2">تاریخچه چت‌ها</h4>
              <div className="space-y-2">
                {chats.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-2">هنوز چتی ندارید.</p>
                ) : (
                  chats.map(chat => (
                    <button
                      key={chat.thread_id}
                      onClick={() => fetchChatHistory(chat.thread_id)}
                      className={`w-full text-right px-4 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm ${currentChatId === chat.thread_id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted text-muted-foreground'
                        }`}
                    >
                      <MessageSquare size={16} />
                      <span className="truncate">{chat.title || 'چت بدون عنوان'}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-auto border-t border-border pt-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold shadow-md uppercase">
                  {user?.name ? user.name.substring(0, 2) : 'MA'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-card-foreground truncate">{user?.name || 'کاربر'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* chat is persistent; no reopen button */}
    </div>
  )
}
