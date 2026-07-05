'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Brain,
  Code2,
  Bot,
  Rocket,
  Shield,
  LineChart,
  ArrowLeft,
  CheckCircle2,
  Users,
} from 'lucide-react'

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

interface Service {
  icon: React.ElementType
  title: string
  description: string
  features: string[]
  color: string
}

const services: Service[] = [
  {
    icon: Brain,
    title: 'פיתוח AI',
    description: 'בניית מודלי Machine Learning, מערכות המלצות, עיבוד שפה טבעית ופתרונות AI מותאמים אישית.',
    features: [
      'מודלי NLP מתקדמים',
      'Computer Vision',
      'מערכות המלצות',
      'חיזוי ואנליטיקה',
    ],
    color: 'from-purple-600 to-pink-600',
  },
  {
    icon: Code2,
    title: 'Full-Stack Development',
    description: 'פיתוח אפליקציות web ומובייל מקצה לקצה עם טכנולוגיות מתקדמות וארכיטקטורה מודרנית.',
    features: [
      'React / Next.js / Vue',
      'Node.js / Python / Go',
      'Microservices',
      'Database Design',
    ],
    color: 'from-cyan-600 to-blue-600',
  },
  {
    icon: Bot,
    title: 'בוטים ואוטומציה',
    description: 'בניית בוטים חכמים לטלגרם, וואטסאפ, דיסקורד ואוטומציה של תהליכים עסקיים.',
    features: [
      "צ'אטבוטים מתקדמים",
      'אוטומציית תהליכים',
      'אינטגרציות API',
      'RPA - רובוטיזציה',
    ],
    color: 'from-green-600 to-teal-600',
  },
  {
    icon: Shield,
    title: 'ייעוץ טכנולוגי',
    description: 'ליווי מקצועי בבחירת טכנולוגיות, ארכיטקטורת מערכות, ואופטימיזציה של תשתיות.',
    features: [
      'בחירת Stack טכנולוגי',
      'ארכיטקטורת מערכות',
      'Code Review',
      'הכשרת צוותים',
    ],
    color: 'from-orange-600 to-red-600',
  },
  {
    icon: Rocket,
    title: 'DevOps \u0026 Cloud',
    description: 'תשתיות ענן, CI/CD, קונטיינריזציה וניטור - הכל לפריסה מהירה ובטוחה.',
    features: [
      'AWS / GCP / Azure',
      'Docker \u0026 Kubernetes',
      'CI/CD Pipelines',
      'Monitoring \u0026 Logging',
    ],
    color: 'from-yellow-600 to-orange-600',
  },
  {
    icon: LineChart,
    title: 'Data Engineering',
    description: 'בניית צינורות נתונים, מחסני נתונים, ומערכות Business Intelligence.',
    features: [
      'ETL / ELT Pipelines',
      'Data Warehousing',
      'Real-time Streaming',
      'BI \u0026 Dashboards',
    ],
    color: 'from-pink-600 to-rose-600',
  },
]

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${service.color} rounded-2xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className="relative h-full glass rounded-2xl p-8 border border-gray-200 dark:border-white/10 hover:border-purple-500/30 transition-all duration-300 overflow-hidden">
        {/* Background Gradient on Hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />

        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} mb-6`}
        >
          <service.icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-cyan-400 transition-colors">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
          {service.description}
        </p>

        {/* Features */}
        <ul className="space-y-2 mb-6">
          {service.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <motion.a
          href="#contact"
          whileHover={{ x: -5 }}
          onClick={() => notifyLead(`service-${service.title}`)}
          className="inline-flex items-center gap-2 text-purple-600 dark:text-cyan-400 text-sm font-medium group/link"
        >
          בוא נדבר
          <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" />
        </motion.a>
      </div>
    </motion.div>
  )
}

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-24 bg-gray-50 dark:bg-black overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-cyan-500/5 dark:bg-cyan-900/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-purple-600/20 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
            שירותים מקצועיים
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            פתרונות טכנולוגיים <span className="gradient-text">מקצה לקצה</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            משלב הרעיון ועד הפרודקשן - צוות Elyashar & Nirko מספק שירותים מקיפים בהתאמה אישית לצרכים שלך
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 glass rounded-2xl">
            <div className="text-right">
              <p className="text-gray-900 dark:text-white font-medium mb-1">צריך משהו ספציפי?</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">אשמח לשמוע על הפרויקט שלך</p>
            </div>
            <motion.a
              href="/#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => notifyLead('services-contact-cta')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-white font-medium whitespace-nowrap"
            >
              צור קשר עכשיו
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
