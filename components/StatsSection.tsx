'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Briefcase, Users, Code2, Award, Clock, Trophy } from 'lucide-react'

interface StatItemProps {
  icon: React.ElementType
  value: number
  suffix: string
  label: string
  delay: number
}

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    const duration = 2000

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * value))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

function StatCard({ icon: Icon, value, suffix, label, delay }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
      <div className="relative glass rounded-2xl p-8 text-center border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-colors">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/30 to-cyan-600/30 mb-4"
        >
          <Icon className="w-8 h-8 text-purple-600 dark:text-cyan-400" />
        </motion.div>
        <div className="text-4xl md:text-5xl font-black mb-2 gradient-text">
          <AnimatedCounter value={value} suffix={suffix} />
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">{label}</p>
      </div>
    </motion.div>
  )
}

export default function StatsSection() {
  const stats = [
    { icon: Briefcase, value: 120, suffix: '+', label: 'פרויקטים שהושלמו' },
    { icon: Users, value: 80, suffix: '+', label: 'לקוחות מרוצים' },
    { icon: Code2, value: 250, suffix: 'K+', label: 'שורות קוד' },
    { icon: Award, value: 20, suffix: '+', label: 'שנות ניסיון משולב' },
    { icon: Clock, value: 99, suffix: '%', label: 'זמינות לפרויקטים' },
    { icon: Trophy, value: 100, suffix: '%', label: 'מחויבות לתוצאות' },
  ]

  return (
    <section className="relative py-20 bg-gray-50 dark:bg-black overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-900/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1 rounded-full bg-purple-600/20 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4"
          >
            ההישגים שלנו במספרים
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            תוצאות ש<span className="gradient-text">מדברות</span> בעד עצמן
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            כל מספר מייצג שעות של עבודה משותפת, לימוד והתמדה במטרה לספק את הטוב ביותר
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Decorative Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
        />
      </div>
    </section>
  )
}
