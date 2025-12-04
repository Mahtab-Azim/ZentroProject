'use client'

import React, { useEffect, useState } from 'react'
import { Send, MessageSquare, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react'

interface ChatMessage {
  id: number
  type: 'user' | 'agent'
  text: string
  timestamp: Date
}

interface Chat {
  id: number
  thread_id: string
  title: string
}

interface User {
  name: string
  email: string
}

export default function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  // رفرنس برای اسکرول خودکار به پایین
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userName = localStorage.getItem('user_name')
    const userEmail = localStorage.getItem('user_email')

    if (userName && userEmail) {
      setUser({ name: userName, email: userEmail })
    }

    if (!token) {
      setIsAuthenticated(false)
      window.location.href = '/auth/login'
      return
    }

    fetchChats(token)

    // Open sidebar by default on desktop
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true)
    } else {
      setIsSidebarOpen(false)
    }
  }, [])

  useEffect(() => {
    // اسکرول به انتهای پیام‌ها هر بار که پیام جدیدی اضافه می‌شود
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const fetchChats = async (token: string) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/agents/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setChats(data)
      }
    } catch (err) {
      console.error('Error fetching chats:', err)
    }
  }

  const fetchChatHistory = async (threadId: string) => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`http://127.0.0.1:8000/api/agents/chats/${threadId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const history = data.map((msg: any) => ({
          id: msg.id,
          type: msg.role === 'user' ? 'user' : 'agent',
          text: msg.content,
          timestamp: new Date(msg.created_at)
        }))
        setMessages(history)
        setCurrentChatId(threadId)
      } else {
        setError('خطا در بارگذاری تاریخچه چت')
      }
    } catch (err) {
      console.error('Error fetching history:', err)
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setError(null)
  }

  // منطق تنظیم ارتفاع TextArea
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    target.style.height = 'auto'
    target.style.height = `${Math.min(target.scrollHeight, 128)}px`
    setInput(target.value)
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const token = localStorage.getItem('access_token')
    if (!token) return

    // تنظیم مجدد ارتفاع بعد از ارسال
    const textarea = document.getElementById('message-input') as HTMLTextAreaElement
    if (textarea) {
      textarea.style.height = '44px'
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      // Prepare request body - only include thread_id if it exists
      const requestBody: any = {
        prompt: userInput
      }

      if (currentChatId) {
        requestBody.thread_id = currentChatId
      }

      console.log('📤 Sending to agent API:', requestBody)

      const res = await fetch('http://127.0.0.1:8000/api/agents/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response status:', res.status)

      if (res.ok) {
        const data = await res.json()
        console.log('✅ Response data:', data)

        const agentMessage: ChatMessage = {
          id: Date.now() + 1,
          type: 'agent',
          text: data.response || data.message || data.content || 'پاسخی دریافت نشد.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, agentMessage])

        // Refresh chats list if it was a new chat
        if (!currentChatId && data.thread_id) {
          setCurrentChatId(data.thread_id)
          fetchChats(token)
        }
      } else {
        const errorData = await res.json()
        console.error('❌ Error response:', errorData)
        console.error('❌ Full error details:', JSON.stringify(errorData, null, 2))

        // Extract validation errors if they exist
        let errorMessage = 'خطا در برقراری ارتباط با هوش مصنوعی'
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Validation errors
            errorMessage = errorData.detail.map((err: any) =>
              `${err.loc?.join('.')} - ${err.msg}`
            ).join(', ')
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          }
        }

        setError(errorMessage)
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'agent',
          text: `خطا: ${errorMessage}`,
          timestamp: new Date()
        }])
      }
    } catch (err) {
      console.error('🔥 Agent Error:', err)
      setError('خطا در شبکه')
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'agent',
        text: 'خطا در شبکه.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Chat History Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-card border-l border-border flex flex-col shrink-0 overflow-hidden`}>
        {isSidebarOpen && (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground">تاریخچه چت‌ها</h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                title="بستن سایدبار"
              >
                <ChevronLeft size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chats.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">هنوز چتی ندارید.</p>
              ) : (
                chats.map(chat => (
                  <button
                    key={chat.id}
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

            {user && (
              <div className="mt-auto border-t border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold shadow-md uppercase">
                    {user.name ? user.name.substring(0, 2) : 'MA'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-foreground truncate">{user.name || 'کاربر'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email || 'user@example.com'}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="نمایش تاریخچه چت‌ها"
              >
                <ChevronRight size={20} className="text-muted-foreground" />
              </button>
            )}
            <div className="bg-primary/10 p-2 rounded-lg">
              <MessageSquare size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">دستیار هوشمند</h1>
              <p className="text-xs text-muted-foreground">
                {isLoading ? 'درحال نوشتن...' : 'آنلاین'}
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

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-4 bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '140px' }}>
          <div className={`${isFullscreen ? 'max-w-4xl' : 'max-w-3xl'} mx-auto p-4 sm:p-6 space-y-6`}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] text-center space-y-6">
                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                  <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={32} className="text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">چطور می‌تونم کمکت کنم؟</h2>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    من می‌تونم در مدیریت تسک‌ها، برنامه‌ریزی و پاسخ به سوالاتت بهت کمک کنم.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  <button
                    onClick={() => setInput('تسک‌های امروز من رو نشون بده')}
                    className="bg-card p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-right text-sm text-foreground"
                  >
                    📅 تسک‌های امروز من رو نشون بده
                  </button>
                  <button
                    onClick={() => setInput('یک تسک جدید برای طراحی بساز')}
                    className="bg-card p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-right text-sm text-foreground"
                  >
                    ✨ یک تسک جدید برای طراحی بساز
                  </button>
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-5 rounded-2xl shadow-sm ${msg.type === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground border border-border rounded-bl-none'
                      }`}
                  >
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[10px] mt-2 ${msg.type === 'user' ? 'opacity-70' : 'text-muted-foreground'}`}>
                      {msg.timestamp.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card p-4 rounded-2xl rounded-bl-none shadow-sm border border-border">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="fixed bottom-0 right-0 p-4 md:p-6 z-30 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg" style={{ left: isSidebarOpen ? '16rem' : '0' }}>
          <div className={`${isFullscreen ? 'max-w-4xl' : 'max-w-3xl'} mx-auto`}>
            <div className="relative flex items-end gap-2 bg-card border border-border rounded-3xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-xl">
              <textarea
                id="message-input"
                value={input}
                onChange={handleInput}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-4 text-foreground placeholder-muted-foreground overflow-hidden"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-1 shrink-0"
              >
                <Send size={20} className={!input.trim() ? "" : "rtl:rotate-180"} />
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2 font-medium">
              هوش مصنوعی ممکن است اشتباه کند. لطفاً اطلاعات مهم را بررسی کنید.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}