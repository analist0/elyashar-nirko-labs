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
  Twitter,
  MessageCircle,
  Clock,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'

const contactInfo = [
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
    icon: MapPin,
    label: 'מיקום',
    value: 'ישראל',
    href: '#',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Clock,
    label: 'זמינות',
    value: '7 ימים בשבוע',
    href: '#',
    color: 'from-orange-500 to-red-500',
  },
]

const socialLinks = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
]

export default function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setSubmitted(true)
    setFormData({ name: '', email: '', phone: '', message: '' })
    
    setTimeout(() => setSubmitted(false), 5000)
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
          <span className="inline-block px-4 py-1 rounded-full bg-purple-600/20 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
            בוא נדבר
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            יש לך רעיון? <span className="gradient-text">בוא נבנה אותו</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            מוכן לשמוע על הפרויקט שלך ולהפוך אותו למציאות
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
                <p className="text-gray-600 dark:text-gray-400">אחזור אליך בהקדם האפשרי</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="תספר לי על הפרויקט שלך..."
                  />
                </div>

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
                      שלח הודעה
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Contact Cards */}
            <div className="grid grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={info.label}
                  href={info.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="glass rounded-xl p-6 border border-gray-200 dark:border-white/10 hover:border-purple-500/30 transition-all group"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${info.color} mb-3 group-hover:scale-110 transition-transform`}>
                    <info.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{info.label}</p>
                  <p className="text-gray-900 dark:text-white font-medium text-sm">{info.value}</p>
                </motion.a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <motion.a
              href="https://wa.me/972584423342"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block p-6 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-white/20">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">דברו איתי בוואטסאפ</h4>
                  <p className="text-white/80 text-sm">תשובה מהירה בדרך כלל תוך שעות</p>
                </div>
                <ArrowLeft className="w-6 h-6 mr-auto" />
              </div>
            </motion.a>

            {/* Social Links */}
            <div className="glass rounded-xl p-6 border border-gray-200 dark:border-white/10">
              <h4 className="text-gray-900 dark:text-white font-medium mb-4">עקבו אחריי</h4>
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
                זמין לפרויקטים חדשים - צ\'אטבוטים, AI, אוטומציה ועוד
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
              <p className="text-gray-900 dark:text-white font-bold text-lg">יוסף אלישר</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">AI & Full-Stack Developer</p>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 כל הזכויות שמורות
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
