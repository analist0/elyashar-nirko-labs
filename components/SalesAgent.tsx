'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { useTheme } from '../src/context/ThemeContext'

interface Message {
  role: 'user' | 'assistant' | 'error'
  content: string
  timestamp: string
  id: string
}

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('chat_session_id')
  if (!id) {
    id = generateSessionId()
    localStorage.setItem('chat_session_id', id)
  }
  return id
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function SalesAgent() {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'שלום! 👋 אני העוזר הדיגיטלי של יוסף אלישר.\nאיך אוכל לעזור לך היום?',
      timestamp: formatTime(new Date()),
      id: 'greeting',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [handedOff, setHandedOff] = useState(false)
  const [unread, setUnread] = useState(0)
  const [sessionId] = useState(() => getSessionId())
  const [isMobile, setIsMobile] = useState(false)
  const [lastPollTime, setLastPollTime] = useState(Date.now())

  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevMessagesLength = useRef(messages.length)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isDark = theme === 'dark'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 480)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    requestAnimationFrame(() => {
      containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
    })
  }, [messages, loading])

  useEffect(() => {
    if (isOpen) {
      setUnread(0)
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen && messages.length > prevMessagesLength.current) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.role === 'assistant') {
        setUnread(prev => prev + 1)
      }
    }
    prevMessagesLength.current = messages.length
  }, [messages, isOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const greeted = localStorage.getItem('chat_greeted')
    if (greeted) return

    const timer = setTimeout(() => {
      if (!isOpen) {
        setUnread(prev => prev + 1)
        localStorage.setItem('chat_greeted', 'true')
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const lineHeight = 20
    const maxHeight = lineHeight * 5
    const newHeight = Math.min(el.scrollHeight, maxHeight)
    el.style.height = `${newHeight}px`
  }, [input])

  // Poll for admin messages when handed off
  useEffect(() => {
    if (!handedOff || !AGENT_URL || !sessionId) return

    const poll = async () => {
      try {
        const baseUrl = AGENT_URL.replace('/chat', '')
        const res = await fetch(`${baseUrl}/messages/${sessionId}?since=${lastPollTime}`, {
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.messages && data.messages.length > 0) {
          const adminMsgs = data.messages.filter((m: any) => m.from === 'admin')
          if (adminMsgs.length > 0) {
            setMessages(prev => [
              ...prev,
              ...adminMsgs.map((m: any) => ({
                role: 'assistant' as const,
                content: m.content,
                timestamp: formatTime(new Date(m.timestamp)),
                id: generateSessionId(),
              })),
            ])
            if (!isOpen) setUnread(prev => prev + adminMsgs.length)
          }
        }
        setLastPollTime(Date.now())
      } catch {
        // Silently ignore polling errors
      }
    }

    pollIntervalRef.current = setInterval(poll, 3000)
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [handedOff, sessionId, isOpen, lastPollTime])

  function resetConversation() {
    setHandedOff(false)
    setMessages([
      {
        role: 'assistant',
        content: 'השיחה הסתיימה. איך אוכל לעזור לך היום?',
        timestamp: formatTime(new Date()),
        id: generateSessionId(),
      },
    ])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chat_session_id')
      localStorage.removeItem('chat_greeted')
    }
  }

  async function sendMessage(textOverride?: string, baseMessages?: Message[]) {
    const text = (textOverride ?? input).trim()
    if (!text || loading) return

    if (text === 'סיים שיחה') {
      resetConversation()
      return
    }

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: formatTime(new Date()),
      id: generateSessionId(),
    }
    const currentMessages = baseMessages ?? messages
    const updated = [...currentMessages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      if (!AGENT_URL) throw new Error('Agent URL not configured')

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 20000)

      const res = await fetch(AGENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated
            .filter(m => m.role !== 'error')
            .map(({ role, content }) => ({ role, content })),
          sessionId,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          timestamp: formatTime(new Date()),
          id: generateSessionId(),
        },
      ])
      if (data.handoff) setHandedOff(true)
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError'
      setMessages(prev => [
        ...prev,
        {
          role: 'error',
          content: isTimeout
            ? 'ה-AI עובד קשה... לחץ כאן לנסות שוב או התקשר ישירות: 058-442-3342'
            : 'מצטערים, יש בעיה טכנית כרגע. ניתן לנסות שוב.',
          timestamp: formatTime(new Date()),
          id: generateSessionId(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleRetry(errorId: string) {
    const errorIndex = messages.findIndex(m => m.id === errorId)
    if (errorIndex === -1) return
    const beforeError = messages.slice(0, errorIndex)
    setMessages(beforeError)

    const lastUserMsg = [...beforeError].reverse().find(m => m.role === 'user')
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content, beforeError)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50" dir="rtl">
      {isOpen && (
        <div
          className={`mb-4 flex flex-col overflow-hidden rounded-2xl ${
            isMobile ? 'w-[calc(100vw-2rem)]' : 'w-80'
          } ${
            isDark
              ? 'bg-gray-950/95 backdrop-blur-xl border border-white/10'
              : 'bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl'
          }`}
        >
          <div className="bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                י
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-none">יוסף אלישר</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {handedOff ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                      </span>
                      <span className="text-white/80 text-xs">יוסף מחובר</span>
                    </>
                  ) : loading ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                      <span className="text-white/80 text-xs">כותב...</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      <span className="text-white/80 text-xs">מחובר</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {handedOff && (
            <div
              className={`flex items-center justify-between gap-2 px-3 py-2 text-xs ${
                isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span>יוסף אלישר מחובר לשיחה</span>
              </div>
              <button
                onClick={resetConversation}
                className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
              >
                סיים שיחה
              </button>
            </div>
          )}

          <div ref={containerRef} className="flex-1 h-64 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className="max-w-[78%] flex flex-col">
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? `${
                            isDark
                              ? 'bg-gray-800 text-gray-100'
                              : 'bg-gray-100 text-gray-900'
                          } rounded-tr-sm`
                        : msg.role === 'error'
                        ? `${
                            isDark
                              ? 'bg-red-900/30 text-red-200'
                              : 'bg-red-100 text-red-700'
                          } rounded-tl-sm cursor-pointer hover:opacity-80 transition-opacity`
                        : 'bg-gradient-to-br from-purple-600 to-cyan-600 text-white rounded-tl-sm'
                    }`}
                    onClick={
                      msg.role === 'error' ? () => handleRetry(msg.id) : undefined
                    }
                  >
                    {msg.content}
                  </div>
                  <span
                    className={`text-[10px] mt-1 ${
                      msg.role === 'user' ? 'text-left' : 'text-right'
                    } ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl rounded-tl-sm px-3 py-2">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map(delay => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`px-3 py-3 border-t flex gap-2 ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="כתוב הודעה..."
              rows={1}
              className={`flex-1 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none overflow-hidden ${
                isDark
                  ? 'bg-gray-900 text-white placeholder-gray-500'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400'
              }`}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 p-2.5 rounded-xl disabled:opacity-50 transition-opacity flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-14 h-14 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform relative ${
          !isOpen && unread > 0 ? 'animate-pulse ring-4 ring-purple-500/50' : ''
        }`}
        aria-label="פתח צ'אט"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
            {unread}
          </span>
        )}
      </button>
    </div>
  )
}
