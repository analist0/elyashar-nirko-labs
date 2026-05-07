'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Code2,
  Database,
  Server,
  Cpu,
  Terminal,
  Cloud,
} from 'lucide-react'

interface SkillCategory {
  icon: React.ElementType
  title: string
  color: string
  skills: { name: string; level: number }[]
}

const skillCategories: SkillCategory[] = [
  {
    icon: Code2,
    title: 'Frontend',
    color: 'from-cyan-500 to-blue-500',
    skills: [
      { name: 'React / Next.js', level: 95 },
      { name: 'TypeScript', level: 92 },
      { name: 'Tailwind CSS', level: 95 },
      { name: 'Vue.js', level: 85 },
      { name: 'Framer Motion', level: 90 },
    ],
  },
  {
    icon: Server,
    title: 'Backend',
    color: 'from-green-500 to-emerald-500',
    skills: [
      { name: 'Node.js / Express', level: 95 },
      { name: 'Python / FastAPI', level: 93 },
      { name: 'Go', level: 85 },
      { name: 'GraphQL', level: 88 },
      { name: 'WebSockets', level: 90 },
    ],
  },
  {
    icon: Database,
    title: 'Database',
    color: 'from-yellow-500 to-orange-500',
    skills: [
      { name: 'PostgreSQL', level: 92 },
      { name: 'MongoDB', level: 90 },
      { name: 'Redis', level: 88 },
      { name: 'Elasticsearch', level: 85 },
      { name: 'Vector DBs', level: 87 },
    ],
  },
  {
    icon: Cpu,
    title: 'AI & ML',
    color: 'from-purple-500 to-pink-500',
    skills: [
      { name: 'OpenAI / GPT', level: 95 },
      { name: 'LangChain', level: 92 },
      { name: 'TensorFlow / PyTorch', level: 85 },
      { name: 'Hugging Face', level: 88 },
      { name: 'Computer Vision', level: 82 },
    ],
  },
  {
    icon: Cloud,
    title: 'Cloud & DevOps',
    color: 'from-orange-500 to-red-500',
    skills: [
      { name: 'AWS', level: 90 },
      { name: 'Docker / Kubernetes', level: 88 },
      { name: 'CI/CD (GitHub Actions)', level: 92 },
      { name: 'Terraform', level: 85 },
      { name: 'Monitoring (Grafana)', level: 87 },
    ],
  },
  {
    icon: Terminal,
    title: 'Tools & Other',
    color: 'from-pink-500 to-rose-500',
    skills: [
      { name: 'Git / GitHub', level: 95 },
      { name: 'Linux / Bash', level: 92 },
      { name: 'Nginx', level: 88 },
      { name: 'Message Queues', level: 85 },
      { name: 'Web Security', level: 87 },
    ],
  },
]

const additionalSkills = [
  'Rust', 'WebAssembly', 'Flutter', 'React Native', 'Electron',
  'Prisma', 'Drizzle', 'tRPC', 'gRPC', 'Apache Kafka',
  'Airflow', 'Spark', 'Neo4j', 'Supabase', 'Firebase',
]

function SkillBar({ name, level, color, delay }: { name: string; level: number; color: string; delay: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-gray-700 dark:text-gray-300 text-sm">{name}</span>
        <span className="text-gray-500 dark:text-gray-500 text-sm">{level}%</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : {}}
          transition={{ duration: 1, delay: delay * 0.1, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  )
}

function SkillCategoryCard({ category, index }: { category: SkillCategory; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass rounded-2xl p-6 border border-gray-200 dark:border-white/10 hover:border-purple-500/30 transition-all"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color}`}>
          <category.icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category.title}</h3>
      </div>

      <div className="space-y-1">
        {category.skills.map((skill, skillIndex) => (
          <SkillBar
            key={skill.name}
            name={skill.name}
            level={skill.level}
            color={category.color}
            delay={index * 0.2 + skillIndex}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function SkillsSection() {
  return (
    <section id="skills" className="relative py-24 bg-white dark:bg-black overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-900/10 rounded-full blur-[150px]" />
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
            הטכנולוגיות שלי
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            ארסנל <span className="gradient-text">טכנולוגי</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            עשרות שנות ניסיון עם הטכנולוגיות המובילות בתעשייה
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {skillCategories.map((category, index) => (
            <SkillCategoryCard key={category.title} category={category} index={index} />
          ))}
        </div>

        {/* Additional Skills Cloud */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border border-gray-200 dark:border-white/10"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            טכנולוגיות נוספות
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {additionalSkills.map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(102, 126, 234, 0.3)' }}
                className="px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-sm border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-all cursor-default"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'שפות תכנות', value: '15+' },
            { label: 'פריימוורקים', value: '25+' },
            { label: 'טכנולוגיות AI', value: '20+' },
            { label: 'כלים', value: '40+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
