'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Linkedin,
  Github,
  MessageCircle,
  Sparkles,
  ArrowLeft,
  Users,
  User,
  AlertTriangle,
  Check,
} from 'lucide-react'

// Messages are relayed through the backend's /widget-message endpoint
// (api/server.js), which holds the Telegram bot tokens server-side. They must
// never live here — this file ships as plain text in the public JS bundle.
// `target` matches a recipient's `id` in the server's TELEGRAM_RECIPIENTS env
// var ("joseph" / "michael"); "both" notifies everyone configured.
const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || ''
const WIDGET_MESSAGE_URL = AGENT_URL ? AGENT_URL.replace(/\/chat\/?$/, '/widget-message') : ''

const josephContact = [
  {
    icon: Phone,
    label: 'טלפון',
    value: '058-442-3342',
    href: 'tel:0584423342',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Mail,
    label: 'אימייל',
    value: 'Jelyashar@gmail.com',
    href: 'mailto:Jelyashar@gmail.com',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageCircle,
    label: 'טלגרם',
    value: 'יוסף אלישר בטלגרם',
    href: 'https://t.me/joseph_elyashar',
    color: 'from-blue-400 to-cyan-400',
  },
]

const michaelContact = [
  {
    icon: Phone,
    label: 'טלפון',
    value: '052-827-7544',
    href: 'tel:0528277544',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Mail,
    label: 'אימייל',
    value: 'michael.nirko@email.com',
    href: 'mailto:michael.nirko@email.com',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageCircle,
    label: 'טלגרם',
    value: 'מיכאל נירקו בטלגרם',
    href: 'https://t.me/michael_nirko',
    color: 'from-blue-400 to-cyan-400',
  },
]

const socialLinks = [
  { icon: Github, href: 'https://github.com/josephelyashar', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/in/josephelyashar', label: 'LinkedIn' },
]

async function sendContactMessage(target: string, data: {
  name: string
  email: string
  phone: string
  message: string
}) {
  if (!WIDGET_MESSAGE_URL) throw new Error('Agent URL not configured')
  const res = await fetch(WIDGET_MESSAGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      phone: data.phone,
      text: data.message,
      target,
      source: 'contact-form',
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res
}

function checkRateLimit(): boolean {
  try {
    const key = 'en-contact-rate-limit'
    const data = localStorage.getItem(key)
    const now = Date.now()
    if (!data) {
      localStorage.setItem(key, JSON.stringify({ count: 1, windowStart: now }))
      return true
    }
    const parsed = JSON.parse(data)
    // 5 minute window, max 3 messages
    if (now - parsed.windowStart > 5 * 60 * 1000) {
      localStorage.setItem(key, JSON.stringify({ count: 1, windowStart: now }))
      return true
    }
    if (parsed.count >= 3) {
      return false
    }
    parsed.count += 1
    localStorage.setItem(key, JSON.stringify(parsed))
    return true
  } catch {
    return true
  }
}

export default function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    partner: 'both', // 'joseph' | 'michael' | 'both'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!checkRateLimit()) {
      setError('יותר מדי הודעות נשלחו. אנא המתן מספר דקות.')
      return
    }

    setIsSubmitting(true)

    try {
      await sendContactMessage(formData.partner, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      })

      setIsSubmitting(false)
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', message: '', partner: 'both' })

      setTimeout(() => setSubmitted(false), 5000)
    } catch {
      setIsSubmitting(false)
      setError('שגיאה בשליחה. אנא נסה שוב.')
    }
  }

  return (
    <section id="contact" className="relative py-24 bg-gray-50 dark:bg-black overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 dark:bg-cyan-900/10 rounded-full blur-[150px]" />
      </div>

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-600/20 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            בוא נדבר
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            יש לך רעיון? <span className="gradient-text">בוא נבנה אותו</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            מוכנים לשמוע על הפרויקט שלך ולהפוך אותו למציאות — Elyashar & Nirko Labs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-8 border border-gray-200 dark:border-white/10"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">שלח הודעה</h3>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">ההודעה נשלחה!</h4>
                <p className="text-gray-600 dark:text-gray-400">נחזור אליך בהקדם האפשרי</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Partner Selection */}
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-3">אל מי לשלוח?</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, partner: 'joseph' })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-sm ${
                        formData.partner === 'joseph'
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-gray-200 dark:border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">JE</span>
                      <span>יוסף</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, partner: 'michael' })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-sm ${
                        formData.partner === 'michael'
                          ? 'border-cyan-500 bg-cyan-500/20 text-white'
                          : 'border-gray-200 dark:border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">MN</span>
                      <span>מיכאל</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, partner: 'both' })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-sm ${
                        formData.partner === 'both'
                          ? 'border-green-500 bg-green-500/20 text-white'
                          : 'border-gray-200 dark:border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs">✓</span>
                      <span>שניהם</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">שם מלא</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="השם שלך"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">אימייל</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">טלפון (אופציונלי)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="05X-XXX-XXXX"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">הודעה</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                    placeholder="תספר לנו על הפרויקט שלך..."
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      שלח ל{formData.partner === 'joseph' ? 'יוסף' : formData.partner === 'michael' ? 'מיכאל' : 'שני השותפים'}
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Contact Info - unchanged below */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Joseph Contact Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6 border border-gray-200 dark:border-white/10"
            >
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold">JE</span>
                יוסף אלישר
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {josephContact.map((info, index) => (
                  <motion.a
                    key={info.label}
                    href={info.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group"
                  >
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${info.color}`}>
                      <info.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{info.label}</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{info.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Michael Contact Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-6 border border-gray-200 dark:border-white/10"
            >
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold">MN</span>
                מיכאל נירקו
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {michaelContact.map((info, index) => (
                  <motion.a
                    key={info.label}
                    href={info.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group"
                  >
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${info.color}`}>
                      <info.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{info.label}</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{info.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* WhatsApp CTA - Joseph */}
            <motion.a
              href="https://wa.me/972584423342"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block p-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-white/20">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">יוסף אלישר - וואטסאפ</h4>
                  <p className="text-white/80 text-sm">058-442-3342 — תשובה מהירה</p>
                </div>
                <ArrowLeft className="w-5 h-5 mr-auto" />
              </div>
            </motion.a>

            {/* WhatsApp CTA - Michael */}
            <motion.a
              href="https://wa.me/972528277544"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-white/20">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">מיכאל נירקו - וואטסאפ</h4>
                  <p className="text-white/80 text-sm">052-827-7544 — תשובה מהירה</p>
                </div>
                <ArrowLeft className="w-5 h-5 mr-auto" />
              </div>
            </motion.a>

            {/* Social Links */}
            <div className="glass rounded-xl p-6 border border-gray-200 dark:border-white/10">
              <h4 className="text-gray-900 dark:text-white font-medium mb-4">עקבו אחרינו</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-purple-600/20 border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Availability Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <p className="text-green-600 dark:text-green-400 text-sm">
                זמינים לפרויקטים חדשים — צ'אטבוטים, AI, אוטומציה ועוד
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-24 pt-12 border-t border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-right">
              <p className="text-gray-900 dark:text-white font-bold text-lg">Elyashar & Nirko Labs</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">AI & Full-Stack Development Partners</p>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} כל הזכויות שמורות
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>נבנה עם</span>
              <span className="text-red-500">❤</span>
              <span>ו-Next.js</span>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}
