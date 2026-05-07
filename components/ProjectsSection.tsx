'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { ExternalLink, Github, Sparkles, Bot, Brain, Globe, Cpu, Lock } from 'lucide-react'
import { useTheme } from '../src/context/ThemeContext'

interface Project {
  title: string
  description: string
  image: string
  tags: string[]
  icon: React.ElementType
  color: string
  demoUrl?: string
  githubUrl?: string
  featured?: boolean
}

const projects: Project[] = [
  {
    title: 'AI Agent Platform',
    description: 'פלטפורמת אייג׳נטים חכמים שמבצעים משימות אוטונומיות - מניתוח נתונים ועד אוטומציה של תהליכים עסקיים מורכבים.',
    image: '/projects/ai-agent.jpg',
    tags: ['Python', 'LangChain', 'OpenAI', 'FastAPI', 'React'],
    icon: Bot,
    color: 'from-purple-600 to-pink-600',
    featured: true,
  },
  {
    title: 'Chatbot Builder',
    description: 'מערכת לבניית בוטים מתקדמים עם NLP, זיהוי כוונות, ולמידה מתמשכת מהשיחות. תמיכה במספר ערוצים.',
    image: '/projects/chatbot.jpg',
    tags: ['Node.js', 'TensorFlow', 'MongoDB', 'Socket.io', 'Redis'],
    icon: Brain,
    color: 'from-cyan-600 to-blue-600',
    featured: true,
  },
  {
    title: 'Smart Automation Suite',
    description: 'סט כלים לאוטומציה חכמה של תהליכים עסקיים - אינטגרציות, זרימות עבודה, ודוחות אנליטיים בזמן אמת.',
    image: '/projects/automation.jpg',
    tags: ['Python', 'Celery', 'PostgreSQL', 'Docker', 'AWS'],
    icon: Cpu,
    color: 'from-green-600 to-teal-600',
  },
  {
    title: 'E-Commerce AI',
    description: 'חנות מקוונת עם המלצות AI מותאמות אישית, חיפוש סמנטי, וניהול מלאי חכם עם חיזוי ביקוש.',
    image: '/projects/ecommerce.jpg',
    tags: ['Next.js', 'Python', 'Vector DB', 'Stripe', 'Tailwind'],
    icon: Globe,
    color: 'from-orange-600 to-red-600',
  },
  {
    title: 'Secure API Gateway',
    description: 'שער API מאובטח עם Rate Limiting, אימות JWT, הצפנה, ולוגים מתקדמים למערכות Enterprise.',
    image: '/projects/security.jpg',
    tags: ['Go', 'Redis', 'Kubernetes', 'Prometheus', 'Vault'],
    icon: Lock,
    color: 'from-red-600 to-pink-600',
  },
  {
    title: 'Data Pipeline',
    description: 'צינור עיבוד נתונים בזמן אמת לאיסוף, עיבוד וניתוח Big Data עם ויזואליזציות אינטראקטיביות.',
    image: '/projects/data.jpg',
    tags: ['Apache Kafka', 'Spark', 'Python', 'Grafana', 'MinIO'],
    icon: Sparkles,
    color: 'from-yellow-600 to-orange-600',
  },
]

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group ${project.featured ? 'md:col-span-2' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative h-full glass rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-all duration-500">
        {/* Image Placeholder with Gradient */}
        <div className={`relative h-48 md:h-64 overflow-hidden bg-gradient-to-br ${project.color}`}>
          <div className="absolute inset-0 bg-black/30" />
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <project.icon className="w-20 h-20 text-white/80" />
          </motion.div>
          
          {project.featured && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold">
              ⭐ פרויקט מוביל
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 bg-white/50 dark:bg-transparent">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-cyan-400 transition-colors">
            {project.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-purple-500/30 hover:bg-purple-600/10 transition-all"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {project.demoUrl && (
              <motion.a
                href={project.demoUrl}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                צפה בדמו
              </motion.a>
            )}
            {project.githubUrl && (
              <motion.a
                href={project.githubUrl}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-800 dark:text-white text-sm font-medium hover:bg-white/10"
              >
                <Github className="w-4 h-4" />
                קוד
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProjectsSection() {
  return (
    <section id="projects" className="relative py-24 bg-white dark:bg-black overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-900/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-4">
            עבודות נבחרות
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            פרויקטים שמדברים ב<span className="gradient-text">קוד</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            כל פרויקט הוא סיפור של אתגר טכנולוגי, פתרון יצירתי, ותוצאה מרשימה
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">רוצה לראות עוד?</p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 glass rounded-full text-gray-800 dark:text-white font-medium hover:bg-white/10 transition-colors"
          >
            בוא נדבר על הפרויקט שלך
            <ExternalLink className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
