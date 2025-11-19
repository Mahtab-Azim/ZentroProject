'use client'

import React, { useEffect, useState } from 'react'
import { Send, Plus } from 'lucide-react'

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

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setIsAuthenticated(false)
      window.location.href = '/auth/login'
    }
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // اضافه کردن پیام کاربر
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
      // اینجا API Agent رو جدا کنی
      const token = localStorage.getItem('access_token')
      
      // نمونه - بعداً با API واقعی جایگزین کن
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            text: async () => ({ message: 'این یک پاسخ نمونه است. API هنوز آماده نیست!' })
          })
        }, 1000)
      })

      const agentMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'agent',
        text: 'این یک پاسخ نمونه است. API هنوز آماده نیست!',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="px-6 pt-24 pb-8 max-w-4xl mx-auto h-screen flex flex-col">
        {/* هدر */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">AI Agent</h1>
          <p className="text-gray-600 mt-2">دستیار هوشمند برای کمک به تسک‌های شما</p>
        </div>

        {/* چت بات */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl flex flex-col border-2 border-blue-200 overflow-hidden">
          {/* پیام‌ها */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-white text-5xl font-bold">AI</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">سلام! من Agent هستم</h2>
                <p className="text-gray-600 max-w-sm">
                  می‌تونم کمکت کنم با تسک‌های خود. چیزی بپرس!
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md lg:max-w-lg p-5 rounded-2xl shadow-md ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm lg:text-base leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-2 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString('fa-IR')}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-5 rounded-2xl shadow-md">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t-2 border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500 font-medium shadow-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* دکمه‌های پایین */}
        {messages.length > 0 && (
          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={handleClearChat}
              className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 font-semibold transition-all shadow-lg"
            >
              پاک کردن چت
            </button>
          </div>
        )}
      </div>
    </div>
  )
}