'use client'

import React, { useEffect, useState, useRef } from 'react'
import { MessageSquare, ChevronRight, Maximize2, Minimize2, PanelRightClose, PanelRightOpen, X, Trash2 } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useRouter } from 'next/navigation'

interface AgentInterfaceProps {
    initialIsOpen?: boolean
    defaultFullscreen?: boolean
    hideTrigger?: boolean
    className?: string
    onOpenChange?: (isOpen: boolean) => void
}

export function AgentInterface({
    initialIsOpen = false,
    defaultFullscreen = false,
    hideTrigger = false,
    className = '',
    onOpenChange
}: AgentInterfaceProps) {
    const router = useRouter()
    const [isChatOpen, setIsChatOpen] = useState(initialIsOpen)
    const [isFullscreen, setIsFullscreen] = useState(defaultFullscreen)

    useEffect(() => {
        onOpenChange?.(isChatOpen)
    }, [isChatOpen, onOpenChange])
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [chatMessages, setChatMessages] = useState<{ type: 'user' | 'agent'; text: string }[]>([])
    const [chatInput, setChatInput] = useState('')
    const [chats, setChats] = useState<{ id: number; thread_id: string; title: string }[]>([])
    const [currentChatId, setCurrentChatId] = useState<string | null>(null)
    const [isAgentLoading, setIsAgentLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [chatToDelete, setChatToDelete] = useState<{ id: number; threadId: string } | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit'
            const scrollHeight = textareaRef.current.scrollHeight

            if (scrollHeight > 200) {
                textareaRef.current.style.height = '200px'
                textareaRef.current.style.overflowY = 'auto'
            } else {
                textareaRef.current.style.height = `${scrollHeight}px`
                textareaRef.current.style.overflowY = 'hidden'
            }
        }
    }, [chatInput])

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (token) {
            fetchChats(token)
        }

        // Open chat by default on desktop if not in page mode
        if (!hideTrigger && window.innerWidth >= 1024) {
            setIsChatOpen(true)
        }
    }, [])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [chatMessages, isAgentLoading])

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

            // Robust mapping to handle different API response formats
            const history = data.map((msg: any) => ({
                type: (msg.role === 'user' || msg.type === 'user' ? 'user' : 'agent') as 'user' | 'agent',
                text: msg.content || msg.text || ''
            }))

            setChatMessages(history)
            setCurrentChatId(threadId)
        } catch (err) {
            console.error('Error fetching history:', err)
        } finally {
            setIsAgentLoading(false)
        }
    }

    const confirmDeleteChat = (e: React.MouseEvent, chatId: number, threadId: string) => {
        e.stopPropagation()
        setChatToDelete({ id: chatId, threadId })
        setShowDeleteConfirm(true)
    }

    const handleDeleteChat = async () => {
        if (!chatToDelete) return

        try {
            const token = localStorage.getItem('access_token')
            if (!token) return

            await api.agent.deleteChat(chatToDelete.id, token)
            setChats(prev => prev.filter(chat => chat.id !== chatToDelete.id))
            if (currentChatId === chatToDelete.threadId) {
                setChatMessages([])
                setCurrentChatId(null)
            }
            setShowDeleteConfirm(false)
            setChatToDelete(null)
        } catch (error) {
            console.error('Error deleting chat:', error)
            alert('خطا در حذف چت')
        }
    }

    const handleNewChat = () => {
        setChatMessages([])
        setCurrentChatId(null)
    }

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return

        const token = localStorage.getItem('access_token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        const userMsg = { type: 'user' as const, text: chatInput }
        setChatMessages(prev => [...prev, userMsg])
        setChatInput('')
        setIsAgentLoading(true)

        try {
            const payload: any = { prompt: chatInput }
            if (currentChatId) {
                payload.thread_id = currentChatId
            }

            const data = await api.agent.sendMessage(payload, token)

            const agentMsg = { type: 'agent' as const, text: data.message || data.response || 'پاسخی دریافت نشد.' }
            setChatMessages(prev => [...prev, agentMsg])

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

    // If hideTrigger is true, we force the chat to be "open" in the UI sense (it's always visible)
    // But we use isChatOpen to toggle the visibility in the widget mode.
    // If hideTrigger is true, we assume it's always visible, so we ignore isChatOpen check for the main container
    const shouldShowChat = hideTrigger || isChatOpen

    return (
        <>
            {/* Chat Toggle Tab (Right Side) - Only show if trigger is enabled and chat is closed */}
            {!hideTrigger && !isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed top-1/2 right-0 -translate-y-1/2 z-[60] bg-primary text-primary-foreground py-6 px-2 rounded-l-2xl shadow-2xl hover:bg-primary/90 transition-[background-color,transform] flex flex-col items-center gap-2 group cursor-pointer"
                >
                    <div className="[writing-mode:vertical-rl] rotate-180 text-xs font-bold tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
                        AI CHAT
                    </div>
                    <MessageSquare size={20} />
                </button>
            )}

            {/* Chat Sidebar/Modal */}
            <div className={`fixed transition-[top,left,right,bottom,width,height,transform,margin,padding,border-radius] duration-500 ease-in-out bg-background/95 backdrop-blur-sm shadow-2xl flex overflow-hidden ${className}
        ${isFullscreen || hideTrigger
                    ? 'top-20 left-0 right-0 bottom-0 z-[60] sm:z-40 sm:top-20 sm:left-2 sm:right-2 sm:bottom-2 rounded-none sm:rounded-2xl border-0 sm:border border-border shadow-2xl' // Fullscreen or Page mode
                    : isChatOpen
                        ? 'top-20 bottom-0 right-0 left-0 sm:left-auto w-full sm:w-96 z-40 rounded-none sm:rounded-l-3xl border-l border-border' // Sidebar Open
                        : 'top-20 bottom-0 right-[-100%] left-auto w-full sm:w-96 z-40' // Sidebar Closed
                }
        ${hideTrigger ? '!top-20 !left-0 !right-0 !bottom-0 !m-0 !rounded-none' : ''} 
      `}>

                {/* Chat History Sidebar (Inner) */}
                {isFullscreen && (
                    <div className={`${isSidebarOpen ? 'w-64' : 'w-0 sm:w-16'} transition-[width] duration-300 bg-card/50 border-l border-border flex flex-col shrink-0 overflow-hidden`}>
                        <div className="p-4 border-b border-border flex items-center justify-between shrink-0 h-[73px]">
                            {isSidebarOpen && <h3 className="font-bold text-foreground whitespace-nowrap">تاریخچه</h3>}
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-muted rounded">
                                {isSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {chats.map(chat => (
                                <div key={chat.thread_id} className="group relative">
                                    <button
                                        onClick={() => fetchChatHistory(chat.thread_id)}
                                        className={`w-full text-right px-3 py-2 rounded-lg text-sm truncate transition-colors pr-3 pl-8 ${currentChatId === chat.thread_id ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {chat.title || 'چت جدید'}
                                    </button>
                                    <button
                                        onClick={(e) => confirmDeleteChat(e, chat.id, chat.thread_id)}
                                        className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-destructive/10"
                                        title="حذف چت"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col h-full relative bg-card/50">
                    {/* Header */}
                    <div className="bg-muted/30 backdrop-blur-md border-b border-border p-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            {!hideTrigger && !isFullscreen && (
                                <button
                                    onClick={() => setIsChatOpen(false)}
                                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                    title="بستن چت"
                                >
                                    <div className="sm:hidden">
                                        <X size={24} />
                                    </div>
                                    <div className="hidden sm:block">
                                        <ChevronRight size={20} />
                                    </div>
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
                            {!hideTrigger && (
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="text-muted-foreground hover:bg-muted p-2 rounded-lg transition-colors hidden lg:block"
                                    title={isFullscreen ? "کوچک کردن" : "تمام صفحه"}
                                >
                                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-custom">
                        {chatMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                                    <MessageSquare size={32} className="text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">پیام جدیدی نیست. چیزی بپرسید!</p>
                            </div>
                        ) : (
                            chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.type === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-bl-none'
                                        : 'bg-muted/50 dark:bg-card text-card-foreground border border-border rounded-br-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 sm:p-4 bg-card/80 backdrop-blur-md border-t border-border shrink-0">
                        <div className="max-w-3xl mx-auto relative flex items-end gap-2">
                            <div className="relative flex-1">
                                <textarea
                                    ref={textareaRef}
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage()
                                        }
                                    }}
                                    placeholder="پیام خود را بنویسید..."
                                    rows={1}
                                    className="w-full bg-muted/50 border border-border rounded-2xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-[box-shadow,border-color] shadow-inner resize-none min-h-[56px] max-h-[200px] scrollbar-custom overflow-hidden"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!chatInput.trim() || isAgentLoading}
                                    className="absolute left-3 bottom-4 p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-[background-color,opacity,transform] shadow-lg flex items-center justify-center"
                                >
                                    {isAgentLoading ? (
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <MessageSquare size={18} className="sm:size-5 rotate-90" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Custom Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card text-card-foreground border border-border rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} className="text-destructive" />
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">حذف تاریخچه چت</h3>
                        <p className="text-muted-foreground text-center mb-8 text-sm">
                            آیا از حذف این چت اطمینان دارید؟ این عمل غیرقابل بازگشت است.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors font-medium"
                            >
                                انصراف
                            </button>
                            <button
                                onClick={handleDeleteChat}
                                className="flex-1 px-4 py-3 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-bold shadow-lg shadow-destructive/20"
                            >
                                بله، حذف شود
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

