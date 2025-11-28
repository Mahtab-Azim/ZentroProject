'use client'

import React, { useEffect, useState } from 'react'
import { Send } from 'lucide-react'

interface ChatMessage {
  id: number
  type: 'user' | 'agent'
  text: string
  timestamp: Date
}

export default function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  // رفرنس برای اسکرول خودکار به پایین
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    // کد احراز هویت شما
    const token = localStorage.getItem('access_token')
    if (!token) {
      setIsAuthenticated(false)
      // window.location.href = '/auth/login' // فعلاً کامنت شد
    }
  }, [])

  useEffect(() => {
    // اسکرول به انتهای پیام‌ها هر بار که پیام جدیدی اضافه می‌شود
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // منطق تنظیم ارتفاع TextArea
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    target.style.height = 'auto' // ریست کردن ارتفاع
    target.style.height = `${Math.min(target.scrollHeight, 128)}px` // محدود کردن به 128px
    setInput(target.value)
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // تنظیم مجدد ارتفاع بعد از ارسال
    const textarea = document.getElementById('message-input') as HTMLTextAreaElement;
    if (textarea) {
        textarea.style.height = '44px'; // ارتفاع اولیه
    }
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // شبیه‌سازی پاسخ Agent
      await new Promise(resolve => setTimeout(resolve, 1000))

      const agentMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'agent',
        text: 'این یک پاسخ نمونه است. API شما اکنون آماده اتصال است.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, agentMessage])
    } catch (err) {
      console.error('خطا در ارسال پیام:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([])
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>درحال انتقال به صفحه ورود...</p>
      </div>
    )
  }

  return (
    // بدنه اصلی - flex-col برای مدیریت محتوای عمودی
    <div className="flex flex-col h-screen bg-gray-50">
      
      {/* Header - ثابت در بالا */}
      <div className="p-4 border-b bg-white shadow-sm flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">AI Agent</h1>
            <p className="text-xs text-gray-500">دستیار هوشمند شما</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            پاک کردن چت
          </button>
        )}
      </div>

      {/* Messages Area - بخش قابل اسکرول */}
      {/* padding-bottom را طوری تنظیم کردم که زیر Input ثابت نرود. */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '140px' }}>
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] text-center space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-blue-100">
                <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-blue-200">
                  <span className="text-white text-3xl font-bold">AI</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">چطور می‌تونم کمکت کنم؟</h2>
                <p className="text-gray-500 max-w-xs mx-auto">
                  من می‌تونم در مدیریت تسک‌ها، برنامه‌ریزی و پاسخ به سوالاتت بهت کمک کنم.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                <button
                  onClick={() => setInput('تسک‌های امروز من رو نشون بده')}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-right text-sm text-gray-700"
                >
                  📅 تسک‌های امروز من رو نشون بده
                </button>
                <button
                  onClick={() => setInput('یک تسک جدید برای طراحی بساز')}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-right text-sm text-gray-700"
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
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                    }`}
                >
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-[10px] mt-2 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          {/* رفرنس برای اسکرول به پایین */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-30 bg-gray-50 border-t border-gray-200 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-white border border-gray-200 rounded-3xl p-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-xl">
            <textarea
              id="message-input"
              value={input}
              onChange={handleInput} // استفاده از هندلر جدید
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="پیام خود را بنویسید..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-4 text-gray-900 placeholder-gray-500 overflow-hidden"
              rows={1}
              // توجه: منطق تنظیم ارتفاع در handleInput انجام می‌شود.
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-1 shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2 font-medium">
            هوش مصنوعی ممکن است اشتباه کند. لطفاً اطلاعات مهم را بررسی کنید.
          </p>
        </div>
      </div>
    </div>
  )
}