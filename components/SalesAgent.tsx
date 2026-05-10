'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Loader2, Copy, Check, Sparkles, Lightbulb } from 'lucide-react'
import { useTheme } from '../src/context/ThemeContext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant' | 'error'
  content: string
  displayContent?: string
  isTyping?: boolean
  timestamp: string
  id: string
}

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL

const QUICK_REPLIES = [
  { label: 'מי זה יוסף?', icon: '👤' },
  { label: 'איזה שירותים?', icon: '🛠️' },
  { label: 'טכנולוגיות', icon: '⚡' },
  { label: 'בוא נדבר על פרויקט', icon: '🚀' },
  { label: 'צור קשר', icon: '📞' },
]

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

function useTypewriter(
  text: string,
  speed: number,
  enabled: boolean,
  onComplete?: () => void
) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text)
      return
    }
    indexRef.current = 0
    setDisplayed('')

    intervalRef.current = setInterval(() => {
      indexRef.current += 1
      if (indexRef.current >= text.length) {
        setDisplayed(text)
        if (intervalRef.current) clearInterval(intervalRef.current)
        onComplete?.()
      } else {
        setDisplayed(text.slice(0, indexRef.current))
      }
    }, speed)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [text, speed, enabled, onComplete])

  return displayed
}

function StatusIndicator({ status }: { status: 'connected' | 'typing' | 'handoff' }) {
  if (status === 'handoff') {
    return (
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
        <span className="text-white/80 text-xs">יוסף מחובר</span>
      </span>
    )
  }
  if (status === 'typing') {
    return (
      <span className="flex items-center gap-1.5">
        <span className="flex gap-0.5 items-center h-2">
          {[0, 150, 300].map(delay => (
            <span
              key={delay}
              className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        <span className="text-white/80 text-xs">כותב...</span>
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
      <span className="text-white/80 text-xs">מחובר</span>
    </span>
  )
}

function TypingBubble() {
  return (
    <div className="flex justify-end">
      <div className="relative overflow-hidden rounded-2xl rounded-tl-sm px-4 py-3 bg-gradient-to-br from-purple-600/90 to-cyan-600/90 backdrop-blur-sm border border-white/10">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 120, 240].map(delay => (
            <span
              key={delay}
              className="w-2 h-2 bg-white/90 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
      </div>
    </div>
  )
}

function MarkdownContent({ content, isDark }: { content: string; isDark: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-2 hover:opacity-80 transition-opacity ${
              isDark ? 'text-cyan-300' : 'text-purple-700'
            }`}
          />
        ),
        strong: ({ node, ...props }) => <strong {...props} className="font-bold" />,
        code: ({ node, inline, ...props }: any) =>
          inline ? (
            <code
              {...props}
              className={`px-1.5 py-0.5 rounded text-[13px] font-mono ${
                isDark ? 'bg-purple-500/20 text-purple-200' : 'bg-purple-100 text-purple-800'
              }`}
            />
          ) : (
            <pre
              className={`p-3 rounded-xl overflow-x-auto my-2 text-[13px] font-mono leading-relaxed ${
                isDark ? 'bg-black/40 text-purple-200' : 'bg-gray-100 text-gray-800'
              }`}
              dir="ltr"
            >
              <code {...props} />
            </pre>
          ),
        ul: ({ node, ...props }) => (
          <ul {...props} className="list-disc list-inside my-1.5 space-y-0.5" dir="rtl" />
        ),
        ol: ({ node, ...props }) => (
          <ol {...props} className="list-decimal list-inside my-1.5 space-y-0.5" dir="rtl" />
        ),
        p: ({ node, ...props }) => <p {...props} className="my-1 leading-relaxed" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function ChatMessage({
  msg,
  isDark,
  onRetry,
}: {
  msg: Message
  isDark: boolean
  onRetry?: (id: string) => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const isUser = msg.role === 'user'
  const isError = msg.role === 'error'
  const isBot = msg.role === 'assistant'

  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
      <div className="max-w-[85%] flex flex-col gap-1">
        <div
          className={`relative group rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap transition-all duration-300 ${
            isUser
              ? `${isDark ? 'bg-gray-800/90 text-gray-100' : 'bg-gray-100/90 text-gray-900'} rounded-tr-sm shadow-sm`
              : isError
              ? `${isDark ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-700'} rounded-tl-sm cursor-pointer hover:opacity-80 transition-opacity shadow-sm`
              : `bg-gradient-to-br from-purple-600/90 to-cyan-600/90 text-white rounded-tl-sm shadow-lg shadow-purple-500/10 border border-white/10`
          }`}
          onClick={isError && onRetry ? () => onRetry(msg.id) : undefined}
        >
          {isBot && !msg.isTyping ? (
            <MarkdownContent content={msg.displayContent || msg.content} isDark={isDark} />
          ) : (
            <span className={isBot ? 'font-normal' : ''}>{msg.displayContent || msg.content}</span>
          )}
          {isBot && !msg.isTyping && (
            <button
              onClick={handleCopy}
              className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/10"
              title="העתק"
            >
              {copied ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3 text-white/60" />}
            </button>
          )}
        </div>
        <span
          className={`text-[10px] ${isUser ? 'text-left' : 'text-right'} ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}
        >
          {msg.timestamp}
        </span>
      </div>
    </div>
  )
}

export default function SalesAgent() {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'שלום! 👋 אני העוזר הדיגיטלי של יוסף אלישר.\nאיך אוכל לעזור לך היום?',
      displayContent: 'שלום! 👋 אני העוזר הדיגיטלי של יוסף אלישר.\nאיך אוכל לעזור לך היום?',
      isTyping: false,
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
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)

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
  }, [messages, loading, showSuggestions])

  useEffect(() => {
    if (isOpen) {
      setUnread(0)
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen && messages.length > prevMessagesLength.current) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.role === 'assistant' && !lastMsg.isTyping) {
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

  // Typing animation effect
  useEffect(() => {
    if (!typingMessageId) return

    const msg = messages.find(m => m.id === typingMessageId)
    if (!msg || !msg.isTyping) return

    let index = 0
    const fullText = msg.content
    const speed = 18 // ms per character

    const interval = setInterval(() => {
      index += 1
      if (index >= fullText.length) {
        setMessages(prev =>
          prev.map(m =>
            m.id === typingMessageId
              ? { ...m, displayContent: fullText, isTyping: false }
              : m
          )
        )
        setTypingMessageId(null)
        clearInterval(interval)
      } else {
        setMessages(prev =>
          prev.map(m =>
            m.id === typingMessageId
              ? { ...m, displayContent: fullText.slice(0, index) }
              : m
          )
        )
      }
    }, speed)

    return () => clearInterval(interval)
  }, [typingMessageId])

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
                displayContent: m.content,
                isTyping: false,
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
    setShowSuggestions(true)
    setTypingMessageId(null)
    setMessages([
      {
        role: 'assistant',
        content: 'השיחה הסתיימה. איך אוכל לעזור לך היום?',
        displayContent: 'השיחה הסתיימה. איך אוכל לעזור לך היום?',
        isTyping: false,
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

    setShowSuggestions(false)
    const userMsg: Message = {
      role: 'user',
      content: text,
      displayContent: text,
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

      const botMsgId = generateSessionId()
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          displayContent: '',
          isTyping: true,
          timestamp: formatTime(new Date()),
          id: botMsgId,
        },
      ])
      setTypingMessageId(botMsgId)
      setShowSuggestions(true)
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
          displayContent: isTimeout
            ? 'ה-AI עובד קשה... לחץ כאן לנסות שוב או התקשר ישירות: 058-442-3342'
            : 'מצטערים, יש בעיה טכנית כרגע. ניתן לנסות שוב.',
          timestamp: formatTime(new Date()),
          id: generateSessionId(),
        },
      ])
      setShowSuggestions(true)
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

  const handleQuickReply = (text: string) => {
    sendMessage(text)
  }

  const lastBotMsg = [...messages].reverse().find(m => m.role === 'assistant' && !m.isTyping)
  const status: 'connected' | 'typing' | 'handoff' = handedOff
    ? 'handoff'
    : loading || typingMessageId
    ? 'typing'
    : 'connected'

  return (
    <div className="fixed bottom-6 right-6 z-50" dir="rtl">
      {isOpen && (
        <div
          className={`mb-4 flex flex-col overflow-hidden rounded-3xl ${
            isMobile ? 'w-[calc(100vw-2rem)]' : 'w-[22rem]'
          } ${
            isDark
              ? 'bg-gray-950/90 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-purple-900/20'
              : 'bg-white/95 backdrop-blur-2xl border border-gray-200/80 shadow-2xl shadow-purple-500/10'
          }`}
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 px-4 py-3.5 flex items-center justify-between">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 animate-spin-slow opacity-70 blur-[2px]" />
                <div className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-lg border border-white/20">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">יוסף אלישר</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <StatusIndicator status={status} />
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="relative text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Handoff Banner */}
          {handedOff && (
            <div
              className={`flex items-center justify-between gap-2 px-3 py-2 text-xs backdrop-blur-sm ${
                isDark ? 'bg-blue-500/15 text-blue-300 border-b border-blue-500/20' : 'bg-blue-50 text-blue-700 border-b border-blue-100'
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
                className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors font-medium"
              >
                סיים שיחה
              </button>
            </div>
          )}

          {/* Messages */}
          <div
            ref={containerRef}
            className={`flex-1 h-72 overflow-y-auto p-4 space-y-3 scroll-smooth ${
              isDark ? 'scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent' : 'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
            }`}
            style={{ scrollbarWidth: 'thin' }}
          >
            {messages.map(msg => (
              <ChatMessage
                key={msg.id}
                msg={msg}
                isDark={isDark}
                onRetry={handleRetry}
              />
            ))}

            {loading && !typingMessageId && <TypingBubble />}

            {/* Quick Reply Suggestions */}
            {showSuggestions && !loading && !typingMessageId && (
              <div className="flex flex-wrap gap-1.5 pt-1 justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5 w-full justify-end">
                  <Lightbulb className="w-3 h-3" />
                  <span>הצעות מהירות</span>
                </div>
                {QUICK_REPLIES.map(reply => (
                  <button
                    key={reply.label}
                    onClick={() => handleQuickReply(reply.label)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 border ${
                      isDark
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:border-purple-400/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                        : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                    }`}
                  >
                    <span className="ml-1">{reply.icon}</span>
                    {reply.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className={`px-3 py-3 border-t flex gap-2 ${
              isDark ? 'border-gray-800/80 bg-gray-950/50' : 'border-gray-200/80 bg-gray-50/50'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="כתוב הודעה..."
              rows={1}
              className={`flex-1 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none overflow-hidden transition-shadow ${
                isDark
                  ? 'bg-gray-900/80 text-white placeholder-gray-500 border border-gray-800 focus:border-purple-500/50'
                  : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-purple-400/50'
              }`}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 p-2.5 rounded-xl disabled:opacity-40 disabled:scale-100 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
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

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-14 h-14 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all duration-300 relative group ${
          isOpen
            ? 'bg-gradient-to-r from-gray-700 to-gray-800 rotate-0 scale-100'
            : 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:scale-110 active:scale-95 animate-float'
        } ${!isOpen && unread > 0 ? 'animate-pulse ring-4 ring-purple-500/40' : ''}`}
        aria-label="פתח צ'אט"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1 shadow-lg animate-bounce">
            {unread}
          </span>
        )}
        {!isOpen && unread === 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
        )}
      </button>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
