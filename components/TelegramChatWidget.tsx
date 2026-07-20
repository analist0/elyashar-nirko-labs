'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

// Messages are relayed through the backend's /widget-message endpoint
// (api/server.js), which holds the Telegram bot tokens server-side. They must
// never live here — this file ships as plain text in the public JS bundle.
const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || ''
const WIDGET_MESSAGE_URL = AGENT_URL ? AGENT_URL.replace(/\/chat\/?$/, '/widget-message') : ''

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'system'
  timestamp: number
  status: 'sent' | 'sending' | 'error'
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

async function sendWidgetMessage(name: string, email: string, text: string) {
  if (!WIDGET_MESSAGE_URL) throw new Error('Agent URL not configured')
  const res = await fetch(WIDGET_MESSAGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, text }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res
}

export default function TelegramChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [showNameForm, setShowNameForm] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('en-chat-messages')
      const savedName = localStorage.getItem('en-chat-name')
      const savedEmail = localStorage.getItem('en-chat-email')
      if (saved) setMessages(JSON.parse(saved))
      if (savedName) {
        setUserName(savedName)
        setShowNameForm(false)
      }
      if (savedEmail) setUserEmail(savedEmail)
    } catch { /* ignore */ }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('en-chat-messages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim()) return
    localStorage.setItem('en-chat-name', userName)
    localStorage.setItem('en-chat-email', userEmail)
    setShowNameForm(false)

    const welcomeMsg: ChatMessage = {
      id: generateId(),
      text: `שלום ${userName}! 👋\nברוכים הבאים לצ'אט של Elyashar & Nirko Labs.\n\nאנחנו מקבלים את ההודעות ישירות בטלגרם ונחזור אליך בהקדם!`,
      sender: 'system',
      timestamp: Date.now(),
      status: 'sent',
    }
    setMessages([welcomeMsg])
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isSending) return

    const text = inputText.trim()
    const msgId = generateId()

    const userMsg: ChatMessage = {
      id: msgId,
      text,
      sender: 'user',
      timestamp: Date.now(),
      status: 'sending',
    }

    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsSending(true)

    try {
      await sendWidgetMessage(userName, userEmail, text)

      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, status: 'sent' as const } : m))
      )
    } catch {
      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, status: 'error' as const } : m))
      )
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all duration-300 relative group"
        style={{ background: 'linear-gradient(135deg, #9333ea 0%, #06b6d4 100%)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="פתח צ'אט"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} className="relative">
              <MessageCircle className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 left-6 z-50 w-[90vw] max-w-[380px] h-[500px] max-h-[70vh] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #06b6d4 100%)' }}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">Elyashar & Nirko Labs</h3>
                <p className="text-white/70 text-xs">צ'אט חי - נענה בטלגרם</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {showNameForm ? (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmitName} className="space-y-3">
                  <p className="text-gray-300 text-sm text-center mb-4">ברוכים הבאים! איך קוראים לך?</p>
                  <input
                    type="text"
                    placeholder="השם שלך"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                  />
                  <input
                    type="email"
                    placeholder="אימייל (אופציונלי)"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                    dir="ltr"
                  />
                  <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                    התחל צ'אט
                  </button>
                </motion.form>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">שלח הודעה ונחזור אליך בטלגרם!</p>
                    </div>
                  )}
                  {messages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-br-md' : 'bg-white/5 text-gray-300 border border-white/10 rounded-bl-md'}`}>
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] opacity-60">{formatTime(msg.timestamp)}</span>
                          {msg.sender === 'user' && msg.status === 'sending' && <span className="text-[10px] opacity-60">...</span>}
                          {msg.sender === 'user' && msg.status === 'sent' && <span className="text-[10px] opacity-60">✓</span>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            {!showNameForm && (
              <form onSubmit={handleSendMessage} className="px-3 py-3 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="הקלד הודעה..."
                  disabled={isSending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                />
                <motion.button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
