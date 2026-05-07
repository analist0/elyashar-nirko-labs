'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { Sparkles, Code2, Brain, Cpu, ChevronDown, Zap } from 'lucide-react'
import { useTheme } from '../src/context/ThemeContext'

function notifyLead(source: string) {
  const apiBase = process.env.NEXT_PUBLIC_AGENT_URL?.replace('/chat', '') || 'http://localhost:3004'
  fetch(`${apiBase}/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  }).catch(() => {
    // silently fail
  })
}

const roles = [
  'מפתח AI',
  'Full-Stack Developer',
  'בונה בוטים',
  'מומחה אוטומציה',
  'יועץ טכנולוגי',
]

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme, mounted } = useTheme()

  useEffect(() => {
    if (!mounted) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
    }> = []

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
      })
    }

    let animationId: number

    function animate() {
      const isDark = theme === 'dark'
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, i) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = isDark 
          ? `rgba(102, 126, 234, ${particle.alpha})`
          : `rgba(124, 58, 237, ${particle.alpha})`
        ctx.fill()

        particles.slice(i + 1).forEach((other) => {
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = isDark
              ? `rgba(102, 126, 234, ${0.1 * (1 - distance / 150)})`
              : `rgba(124, 58, 237, ${0.1 * (1 - distance / 150)})`
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [theme, mounted])

  const isDark = mounted ? theme === 'dark' : true

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 transition-colors duration-300"
      style={{ 
        background: isDark
          ? 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)'
      }}
    />
  )
}

function TypingAnimation() {
  const [currentRole, setCurrentRole] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const role = roles[currentRole]
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < role.length) {
          setDisplayText(role.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentRole((currentRole + 1) % roles.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentRole])

  return (
    <span className="text-cyan-600 dark:text-cyan-400">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme, mounted } = useTheme()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const isDark = mounted ? theme === 'dark' : true

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <ParticleBackground />

      {/* Floating Orbs */}
      {isDark ? (
        <>
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full blur-[120px] opacity-20"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600 rounded-full blur-[120px] opacity-20"
            animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      ) : (
        <>
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full blur-[120px] opacity-30"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-[120px] opacity-30"
            animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center px-4 max-w-6xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">זמין לפרויקטים חדשים</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-6"
        >
          <span className="block text-gray-900 dark:text-white mb-2">יוסף אלישר</span>
          <span className="block text-3xl md:text-4xl lg:text-5xl font-bold">
            <TypingAnimation />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          הופך רעיונות למציאות דיגיטלית עם AI מתקדם, קוד איכותי וחשיבה יצירתית.
          <br />
          <span className="text-cyan-600 dark:text-cyan-400 font-medium">
            מעל 10 שנות ניסיון בבניית פתרונות טכנולוגיים מורכבים.
          </span>
        </motion.p>

        {/* Tech Icons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { icon: Brain, label: 'AI & ML' },
            { icon: Code2, label: 'Full-Stack' },
            { icon: Cpu, label: 'DevOps' },
            { icon: Zap, label: 'אוטומציה' },
          ].map((tech, index) => (
            <motion.div
              key={tech.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass cursor-pointer group"
            >
              <tech.icon className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{tech.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-bold text-white overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              צפה בפרויקטים
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                ←
              </motion.span>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600"
              initial={{ x: '100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>

          <motion.a
            href="tel:0584423342"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => notifyLead('hero-phone')}
            className="px-8 py-4 glass rounded-full font-bold text-gray-800 dark:text-white hover:bg-white/10 transition-colors"
          >
            058-442-3342
          </motion.a>
        </motion.div>

        {/* Email */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-gray-500"
        >
          <a
            href="mailto:Jelyashar@gmail.com"
            onClick={() => notifyLead('hero-email')}
            className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            Jelyashar@gmail.com
          </a>
        </motion.p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-500 dark:text-gray-500">גלול למטה</span>
          <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-500" />
        </motion.div>
      </motion.div>
    </section>
  )
}
