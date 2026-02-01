'use client'

import React, { useEffect, useState, } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    DropAnimation,
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
import { useRouter } from 'next/navigation'
import { AgentInterface } from '@/components/AgentInterface'

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

// Pure visual component for the task card
interface TaskCardProps {
    task: Task;
    isOverlay?: boolean;
    style?: React.CSSProperties;
    attributes?: any;
    listeners?: any;
    onDelete?: (id: number) => void;
    onEdit?: (task: Task) => void;
}

// Pure visual component for the task card
const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(({ task, isOverlay, style, attributes, listeners, onDelete, onEdit }, ref) => {
    const priorityColor = {
        high: 'border-l-red-500',
        medium: 'border-l-yellow-500',
        low: 'border-l-green-500',
    }

    const priorityLabel = { high: 'زیاد', medium: 'متوسط', low: 'کم' }

    return (
        <div
            ref={ref}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-card text-card-foreground rounded-xl p-5 border border-border border-l-4 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out cursor-grab active:cursor-grabbing ${priorityColor[task.priority]} ${isOverlay ? 'shadow-2xl scale-105 cursor-grabbing ring-2 ring-primary/50 opacity-90' : ''}`}
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
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(task) }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-blue-500 p-1 shrink-0"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
                            onPointerDown={(e) => e.stopPropagation()} // Fix: Stop propagation to prevent drag start
                            className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
})
TaskCard.displayName = 'TaskCard'

const SortableTaskItem = ({ task, onDelete, onEdit }: { task: Task; onDelete: (id: number) => void; onEdit: (task: Task) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // Make the original item faded when dragging
    }

    return (
        <TaskCard
            ref={setNodeRef}
            task={task}
            style={style}
            attributes={attributes}
            listeners={listeners}
            onDelete={onDelete}
            onEdit={onEdit}
        />
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
            className={`w-full bg-gray-100/50 dark:bg-muted/40 rounded-2xl p-4 sm:p-5 flex flex-col border-2 transition-[border-color,background-color] ${isOver ? 'border-primary bg-primary/10' : 'border-border'
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

export function TasksInterface() {
    const router = useRouter()
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [projects, setProjects] = useState<Project[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const [isChatOpen, setIsChatOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<any>(null)
    const [user, setUser] = useState<{ name: string; email: string } | null>(null)
    const [showSuccessToast, setShowSuccessToast] = useState(false)

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
    const [shouldAnimate, setShouldAnimate] = useState(false)
    const [activeTask, setActiveTask] = useState<Task | null>(null)

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
            router.push('/auth/login')
            return
        }
        fetchTasks(token)

        // Enable animation after initial render
        const timer = setTimeout(() => setShouldAnimate(true), 500)
        return () => clearTimeout(timer)
    }, [])

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


    const handleDragStart = (event: any) => {
        const { active } = event
        const task = tasks.find(t => t.id === active.id)
        if (task) setActiveTask(task)
    }

    const handleDragEnd = async (event: any) => {
        const { active, over } = event
        setActiveTask(null)

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
                setTimeout(() => router.push('/auth/login'), 2000)
                return
            }
            setError('خطا در ارتباط با سرور')
        }
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.3',
                },
            },
        }),
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
            <div className={`flex-1 px-3 sm:px-6 pt-24 pb-8 overflow-auto ${shouldAnimate ? 'transition-[margin,padding] duration-300' : ''} ${isChatOpen ? 'lg:mr-96' : 'mr-0'}`}>
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">تسک های من</h1>
                        <p className="text-muted-foreground mt-2">مدیریت تسک‌های خود</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => router.push('/projects')}
                            className="bg-gradient-to-r from-cyan-400/30 to-blue-500/30 dark:from-cyan-500/10 dark:to-blue-600/10 border-2 border-cyan-400/60 dark:border-blue-600 px-4 py-2 rounded-xl hover:from-cyan-400/40 hover:to-blue-500/40 dark:hover:from-cyan-500/20 dark:hover:to-blue-600/20 transition-[background-color,box-shadow] cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <p className="text-xs text-cyan-700 dark:text-muted-foreground font-medium">پروژه‌ها</p>
                            <p className="text-sm font-bold text-cyan-900 dark:text-foreground">مدیریت پروژه‌ها</p>
                        </button>
                        <button
                            onClick={() => router.push('/sprints')}
                            className="bg-gradient-to-r from-blue-400/30 to-indigo-500/30 dark:from-blue-500/10 dark:to-blue-600/10 border-2 border-blue-400/60 dark:border-blue-600 px-4 py-2 rounded-xl hover:from-blue-400/40 hover:to-indigo-500/40 dark:hover:from-blue-500/20 dark:hover:to-blue-600/20 transition-[background-color,box-shadow] cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <p className="text-xs text-blue-700 dark:text-muted-foreground font-medium">اسپرینت فعال</p>
                            <p className="text-sm font-bold text-blue-900 dark:text-foreground">Sprint فعلی • {tasks.length} تسک</p>
                        </button>
                        <button
                            onClick={openAddModal}
                            className="bg-blue-600 text-white px-6 py-3 sm:py-4 rounded-2xl flex items-center gap-3 hover:bg-blue-700 shadow-xl transition-[background-color,box-shadow] cursor-pointer font-semibold"
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
                                        className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-lg cursor-pointer transition-[background-color,opacity]"
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
                    onDragStart={handleDragStart}
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
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeTask ? (
                            <TaskCard
                                task={activeTask}
                                isOverlay
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div >


            <AgentInterface onOpenChange={setIsChatOpen} />
        </div >
    )
}
