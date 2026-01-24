'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Plus,
    Users,
    Calendar,
    Search,
    Filter,
    ArrowRight,
    Clock,
    X,
    CheckCircle2,
    Loader2,
    Briefcase,
    Trash2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CustomSelect } from '@/components/ui/custom-select'
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import { api } from '@/lib/api-client'
import { SimpleToast } from '@/components/ui/simple-toast'

// Types
interface User {
    id: number
    name: string
    email: string
}

interface Sprint {
    id: number
    name: string
    description?: string
    startDate: string
    endDate: string
    status: 'active' | 'planned' | 'completed'
    progress: number
    is_active: boolean
}

interface Project {
    id: number
    name: string
    description: string
    members: any[] // API might return different structure
    sprints: Sprint[]
    created_at?: string
}

export function ProjectsInterface() {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error', isVisible: boolean }>({ message: '', type: 'success', isVisible: false })
    const [activeTab, setActiveTab] = useState<'members' | 'sprints'>('members')

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, isVisible: true })
    }

    // Filter & Search
    const [searchQuery, setSearchQuery] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filterRole, setFilterRole] = useState<string>('all')
    const [filterSprint, setFilterSprint] = useState<string>('all')
    const [filterMembers, setFilterMembers] = useState<string>('all')

    // Forms
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectDesc, setNewProjectDesc] = useState('')

    const [newMemberId, setNewMemberId] = useState<string>('')
    const [newMemberRole, setNewMemberRole] = useState('member')
    const [users, setUsers] = useState<User[]>([])

    const [newSprintName, setNewSprintName] = useState('')
    const [newSprintDesc, setNewSprintDesc] = useState('')
    const [newSprintStart, setNewSprintStart] = useState<any>(null)
    const [newSprintEnd, setNewSprintEnd] = useState<any>(null)

    // Fetch Data
    const fetchProjects = async () => {
        try {
            setIsLoading(true)
            const token = localStorage.getItem('access_token')
            if (!token) return

            const data = await api.projects.list(token)

            // Ensure sprints array exists
            const projectsWithSprints = await Promise.all(data.map(async (p: any) => {
                // Fetch sprints for each project to show active sprint in card
                try {
                    const sprints = await api.projects.getSprints(p.id, token)
                    return { ...p, sprints, members: p.members || [] }
                } catch (e) {
                    return { ...p, sprints: [], members: p.members || [] }
                }
            }))
            setProjects(projectsWithSprints)
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) return

            const data = await api.users.list(token)
            setUsers(data)
        } catch (error) {
        }
    }

    useEffect(() => {
        fetchProjects()
        fetchUsers()
    }, [])

    // Actions
    const handleCreateProject = async () => {
        if (!newProjectName) return
        const token = localStorage.getItem('access_token')
        if (!token) return

        try {
            await api.projects.create({
                name: newProjectName,
                description: newProjectDesc
            }, token)

            setIsCreateModalOpen(false)
            setNewProjectName('')
            setNewProjectDesc('')
            fetchProjects()
        } catch (error) {
            console.error(error)
        }
    }

    const handleAddMember = async () => {
        if (!selectedProject || !newMemberId) return
        const token = localStorage.getItem('access_token')
        if (!token) return

        try {
            await api.projects.addMember(selectedProject.id, newMemberId, newMemberRole, token)

            showToast('کاربر با موفقیت اضافه شد', 'success')
            setNewMemberId('')
            fetchProjects() // Simple refresh
        } catch (error) {
            console.error(error)
            showToast('خطا در افزودن کاربر', 'error')
        }
    }


    const handleCreateSprint = async () => {
        if (!selectedProject || !newSprintName) return
        const token = localStorage.getItem('access_token')
        if (!token) return
        const projectId = selectedProject.id

        try {
            const payload = {
                project_id: projectId,
                name: newSprintName,
                description: newSprintDesc,
                start_date: newSprintStart ? newSprintStart.toDate().toISOString().split('T')[0] : '',
                end_date: newSprintEnd ? newSprintEnd.toDate().toISOString().split('T')[0] : '',
                is_active: false
            }

            await api.projects.createSprint(payload, token)



            showToast('اسپرینت ساخته شد', 'success')
            setNewSprintName('')
            setNewSprintDesc('')
            setNewSprintStart(null)
            setNewSprintEnd(null)

            // Refresh sprints for selected project
            const sprints = await api.projects.getSprints(projectId, token)

            setSelectedProject(prev => prev ? { ...prev, sprints } : null)
            // Also update main list
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, sprints } : p))
        } catch (error) {
            console.error('Error creating sprint:', error)
        }
    }

    const handleActivateSprint = async (sprintId: number) => {
        if (!selectedProject) return
        const token = localStorage.getItem('access_token')
        if (!token) return
        const projectId = selectedProject.id

        try {
            await api.projects.activateSprint(projectId, sprintId, token)



            showToast('اسپرینت فعال شد', 'success')
            // Refresh sprints
            const sprints = await api.projects.getSprints(projectId, token)
            setSelectedProject(prev => prev ? { ...prev, sprints } : null)
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, sprints } : p))
        } catch (error) {
            console.error('Error activating sprint:', error)
        }
    }

    const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation() // Prevent card click
        setProjectToDelete(project)
    }

    const confirmDeleteProject = async () => {
        if (!projectToDelete) return

        const token = localStorage.getItem('access_token')
        if (!token) return

        try {
            // The endpoint is /projects/epics/{projectId} based on user requirement
            // api-client.ts has delete: (projectId) => request(..., { method: 'DELETE' })
            await api.projects.delete(projectToDelete.id, token)
            // Remove from state immediately
            setProjects(prev => prev.filter(p => p.id !== projectToDelete.id))
            // Also close modal if open and it's the deleted project
            if (selectedProject?.id === projectToDelete.id) setIsModalOpen(false)
            setProjectToDelete(null)
            showToast('پروژه با موفقیت حذف شد', 'success')
        } catch (error) {
            console.error('Error deleting project:', error)
            showToast('خطا در حذف پروژه - لطفا مجددا تلاش کنید', 'error')
        }
    }

    // Filter & Search Logic
    const filteredProjects = projects.filter(project => {
        // Search filter
        if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !project.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false
        }

        // Role filter
        if (filterRole !== 'all') {
            const userRole = project.members?.find((m: any) => m.role === filterRole)
            if (!userRole) return false
        }

        // Sprint filter
        if (filterSprint === 'active' && !project.sprints?.find(s => s.is_active)) return false
        if (filterSprint === 'inactive' && project.sprints?.find(s => s.is_active)) return false

        // Members count filter
        const memberCount = project.members?.length || 0
        if (filterMembers === 'small' && memberCount > 5) return false
        if (filterMembers === 'medium' && (memberCount <= 5 || memberCount > 15)) return false
        if (filterMembers === 'large' && memberCount <= 15) return false

        return true
    })

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8 pt-24 mt-18">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            پروژه‌ها
                        </h1>
                        <p className="text-muted-foreground mt-2">مدیریت پروژه‌ها، اعضا و اسپرینت‌ها</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.push('/tasks')} className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
                            <ArrowRight className="w-4 h-4 ml-2" />
                            بازگشت به تسک‌ها
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 cursor-pointer" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="w-4 h-4 ml-2" />
                            پروژه جدید
                        </Button>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="جستجوی پروژه..."
                            className="pr-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto cursor-pointer"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter className="w-4 h-4 ml-2" />
                            فیلترها
                            {(filterRole !== 'all' || filterSprint !== 'all' || filterMembers !== 'all') && (
                                <Badge className="mr-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-xs">!</Badge>
                            )}
                        </Button>

                        {/* Filter Dropdown */}
                        {isFilterOpen && (
                            <div className="absolute left-0 top-full mt-2 w-80 bg-card border rounded-xl shadow-xl p-4 z-50 space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold">فیلترها</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setFilterRole('all')
                                            setFilterSprint('all')
                                            setFilterMembers('all')
                                        }}
                                        className="text-xs h-7"
                                    >
                                        پاک کردن همه
                                    </Button>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">نقش من در پروژه</label>
                                    <CustomSelect
                                        value={filterRole}
                                        onChange={(val) => setFilterRole(val as string)}
                                        options={[
                                            { value: 'all', label: 'همه' },
                                            { value: 'admin', label: 'مدیر' },
                                            { value: 'member', label: 'عضو' },
                                            { value: 'viewer', label: 'مشاهده‌گر' },
                                        ]}
                                        placeholder="انتخاب نقش"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">وضعیت اسپرینت</label>
                                    <CustomSelect
                                        value={filterSprint}
                                        onChange={(val) => setFilterSprint(val as string)}
                                        options={[
                                            { value: 'all', label: 'همه' },
                                            { value: 'active', label: 'دارای اسپرینت فعال' },
                                            { value: 'inactive', label: 'بدون اسپرینت فعال' },
                                        ]}
                                        placeholder="وضعیت اسپرینت"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">تعداد اعضا</label>
                                    <CustomSelect
                                        value={filterMembers}
                                        onChange={(val) => setFilterMembers(val as string)}
                                        options={[
                                            { value: 'all', label: 'همه' },
                                            { value: 'small', label: 'کوچک (1-5 نفر)' },
                                            { value: 'medium', label: 'متوسط (6-15 نفر)' },
                                            { value: 'large', label: 'بزرگ (15+ نفر)' },
                                        ]}
                                        placeholder="تعداد اعضا"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Projects Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                                <p className="text-muted-foreground">پروژه‌ای یافت نشد</p>
                            </div>
                        ) : filteredProjects.map(project => (
                            <Card
                                key={project.id}
                                className="hover:shadow-xl hover:scale-[1.02] transition-[transform,box-shadow,border-color] cursor-pointer group border-border/50 hover:border-primary/30 bg-gradient-to-br from-card via-primary/5 to-primary/10 dark:from-card dark:via-primary/5 dark:to-card"
                                onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{project.name}</CardTitle>
                                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                                            {project.members?.length || 0} عضو
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2 mt-2">
                                        {project.description || 'بدون توضیحات'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                        <Clock className="w-4 h-4" />
                                        <span>ایجاد: {project.created_at ? new Date(project.created_at).toLocaleDateString('fa-IR') : '-'}</span>
                                    </div>

                                    <div className="mb-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground text-xs font-medium">اسپرینت فعال:</span>
                                            {project.sprints?.find(s => s.is_active) ? (
                                                <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                                                    {project.sprints.find(s => s.is_active)?.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground/60 text-xs italic">
                                                    ندارد
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Members Avatars (Placeholder if no avatars) */}
                                    <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                                        {project.members?.slice(0, 4).map((member: any) => (
                                            <Avatar key={member.id} className="border-2 border-background w-8 h-8">
                                                <AvatarFallback className="bg-primary/15 text-primary text-xs">
                                                    {member.name ? member.name.slice(0, 1) : 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t bg-primary/5 p-4">
                                    <div className="w-full flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs h-8"
                                            onClick={(e) => handleDeleteClick(e, project)}
                                        >
                                            <Trash2 className="w-4 h-4 ml-2" />
                                            حذف پروژه
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Project Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl p-6">
                            <h2 className="text-2xl font-bold mb-4">ایجاد پروژه جدید</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">نام پروژه</label>
                                    <Input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">توضیحات</label>
                                    <Input value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>انصراف</Button>
                                    <Button onClick={handleCreateProject} className="bg-blue-600 text-white">ایجاد</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {projectToDelete && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                        <div className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                            <div className="flex flex-col items-center text-center p-2">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                                    <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">حذف پروژه</h3>
                                <p className="text-muted-foreground mb-6">
                                    آیا مطمئن هستید که می‌خواهید پروژه <span className="font-bold text-foreground mx-1">"{projectToDelete.name}"</span> را حذف کنید؟ این عملیات غیرقابل بازگشت است و تمام اطلاعات پروژه، اسپرینت‌ها و اعضای آن حذف خواهند شد.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setProjectToDelete(null)}
                                    >
                                        انصراف
                                    </Button>
                                    <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                        onClick={confirmDeleteProject}
                                    >
                                        حذف پروژه
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <SimpleToast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />

                {/* Project Details Modal */}
                {isModalOpen && selectedProject && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-background border border-border rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">

                            {/* Modal Header */}
                            <div className="p-6 border-b flex justify-between items-center bg-blue-50/30 dark:bg-blue-900/10">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                        {selectedProject.name}
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {selectedProject.sprints?.length || 0} اسپرینت
                                        </Badge>
                                    </h2>
                                    <p className="text-muted-foreground text-sm mt-1">{selectedProject.description}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b px-6">
                                <button
                                    onClick={() => setActiveTab('members')}
                                    className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'members'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    اعضا و دسترسی‌ها
                                </button>
                                <button
                                    onClick={() => setActiveTab('sprints')}
                                    className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sprints'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    اسپرینت‌ها
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto flex-1">

                                {/* Members Tab */}
                                {activeTab === 'members' && (
                                    <div className="space-y-6">
                                        {/* Add Member */}
                                        <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 space-y-4">
                                            <h3 className="font-semibold text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                                <Plus className="w-4 h-4" />
                                                افزودن عضو جدید
                                            </h3>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <div className="flex-1">
                                                    <CustomSelect
                                                        value={newMemberId}
                                                        onChange={(val) => setNewMemberId(String(val))}
                                                        options={users.map(u => ({ value: String(u.id), label: u.name || u.email }))}
                                                        placeholder="انتخاب کاربر"
                                                    />
                                                </div>
                                                <div className="w-full sm:w-40">
                                                    <CustomSelect
                                                        value={newMemberRole}
                                                        onChange={(val) => setNewMemberRole(val as string)}
                                                        options={[
                                                            { value: 'admin', label: 'مدیر' },
                                                            { value: 'member', label: 'عضو' },
                                                            { value: 'viewer', label: 'مشاهده‌گر' },
                                                        ]}
                                                        placeholder="نقش"
                                                    />
                                                </div>
                                                <Button onClick={handleAddMember} disabled={!newMemberId} className="bg-blue-600 text-white">افزودن</Button>
                                            </div>
                                        </div>

                                        {/* Members List */}
                                        <div className="space-y-3">
                                            {selectedProject.members?.length === 0 && <p className="text-center text-muted-foreground">هنوز عضوی اضافه نشده است</p>}
                                            {selectedProject.members?.map((member: any) => (
                                                <div key={member.id} className="flex items-center justify-between p-3 bg-card border rounded-xl hover:bg-muted/20 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback className="bg-blue-100 text-blue-700">{member.name ? member.name.slice(0, 1) : 'U'}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-sm">{member.name || 'کاربر بدون نام'}</p>
                                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline">{member.role || 'member'}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sprints Tab */}
                                {activeTab === 'sprints' && (
                                    <div className="space-y-6">
                                        {/* Create Sprint */}
                                        <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 space-y-4">
                                            <h3 className="font-semibold text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                                <Plus className="w-4 h-4" />
                                                ساخت اسپرینت جدید
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Input placeholder="نام اسپرینت" value={newSprintName} onChange={e => setNewSprintName(e.target.value)} className="bg-background" />
                                                <Input placeholder="توضیحات" value={newSprintDesc} onChange={e => setNewSprintDesc(e.target.value)} className="bg-background" />
                                                <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                                                    <DatePicker
                                                        value={newSprintStart}
                                                        onChange={setNewSprintStart}
                                                        calendar={persian}
                                                        locale={persian_fa}
                                                        placeholder="تاریخ شروع"
                                                        inputClass="w-full px-3 py-2 border rounded-md bg-background text-sm"
                                                    />
                                                    <DatePicker
                                                        value={newSprintEnd}
                                                        onChange={setNewSprintEnd}
                                                        calendar={persian}
                                                        locale={persian_fa}
                                                        placeholder="تاریخ پایان"
                                                        inputClass="w-full px-3 py-2 border rounded-md bg-background text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <Button onClick={handleCreateSprint} disabled={!newSprintName} className="w-full bg-blue-600 text-white">ساخت اسپرینت</Button>
                                        </div>

                                        <div className="space-y-4">
                                            {selectedProject.sprints?.map(sprint => (
                                                <div key={sprint.id} className={`border rounded-xl p-4 transition-[border-color,background-color,box-shadow] ${sprint.is_active ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' : 'hover:border-blue-300'}`}>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-bold text-foreground flex items-center gap-2">
                                                                {sprint.name}
                                                                {sprint.is_active && <Badge className="bg-blue-600 hover:bg-blue-700">فعال</Badge>}
                                                            </h4>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {sprint.startDate} تا {sprint.endDate}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">{sprint.description}</p>
                                                        </div>
                                                        {!sprint.is_active && (
                                                            <Button size="sm" variant="outline" onClick={() => handleActivateSprint(sprint.id)} className="text-xs h-8">
                                                                فعال‌سازی
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!selectedProject.sprints || selectedProject.sprints.length === 0) && (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                    <p>هیچ اسپرینتی تعریف نشده است</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
