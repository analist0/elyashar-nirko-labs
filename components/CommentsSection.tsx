'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Send, User, Clock, AlertTriangle } from 'lucide-react'

interface Comment {
  id: string
  name: string
  email?: string
  content: string
  timestamp: string
}

const API_BASE = process.env.NEXT_PUBLIC_AGENT_URL?.replace('/chat', '') || 'http://localhost:3004'

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function generateAvatarColor(name: string): string {
  const colors = [
    'from-purple-500 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-purple-500',
    'from-blue-500 to-indigo-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function CommentsSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [honeypot, setHoneypot] = useState('') // anti-spam
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const loadComments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/comments/${slug}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch {
      setError('שגיאה בטעינת תגובות')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return // spam bot caught
    if (!name.trim() || !content.trim()) {
      setError('נא למלא שם ותוכן')
      return
    }
    if (content.length > 2000) {
      setError('התגובה ארוכה מדי (מקסימום 2000 תווים)')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch(`${API_BASE}/comments/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined, content: content.trim() }),
      })
      if (res.status === 429) {
        setError('אנא המתן 30 שניות בין תגובות')
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSuccess(true)
      setContent('')
      loadComments()
    } catch {
      setError('שגיאה בשליחת תגובה')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-16 pt-8 border-t border-white/10" dir="rtl">
      <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-cyan-400" />
        תגובות
        {comments.length > 0 && (
          <span className="text-sm font-normal text-gray-500">({comments.length})</span>
        )}
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Honeypot field — hidden from humans */}
        <div className="hidden">
          <input type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">שם *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="השם שלך"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">אימייל (אופציונלי)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">תוכן *</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="מה דעתך על המדריך?"
            maxLength={2000}
          />
          <div className="text-xs text-gray-600 text-left mt-1">{content.length}/2000</div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-400 text-sm">התגובה נשלחה בהצלחה!</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          שלח תגובה
        </button>
      </form>

      {/* Comments List */}
      <div className="mt-8 space-y-4">
        {loading && (
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-gray-600 border-t-cyan-400 rounded-full animate-spin" />
            טוען תגובות...
          </div>
        )}

        {comments.length === 0 && !loading && (
          <p className="text-gray-500 text-sm">אין תגובות עדיין. היה הראשון לפרגן!</p>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-r ${generateAvatarColor(comment.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
              >
                {getInitials(comment.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-sm">{comment.name}</span>
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="w-3 h-3" />
                    {formatDate(comment.timestamp)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
