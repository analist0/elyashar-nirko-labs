'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Phone, Mail, MapPin, Code2, Brain, Cpu, Briefcase } from 'lucide-react'

interface Partner {
  name: string
  nameEn: string
  role: string
  phone: string
  email: string
  location: string
  avatar: string
  color: string
  skills: string[]
  icon: React.ElementType
}

const partners: Partner[] = [
  {
    name: 'יוסף אלישר',
    nameEn: 'Joseph Elyashar',
    role: 'Full-Stack \u0026 AI Developer',
    phone: '058-442-3342',
    email: 'Jelyashar@gmail.com',
    location: 'רמת גן, ישראל',
    avatar: 'JE',
    color: 'from-purple-600 to-pink-600',
    skills: ['React / Next.js', 'Node.js / Python', 'AI / ML', 'DevOps'],
    icon: Brain,
  },
  {
    name: 'מיכאל נירקו',
    nameEn: 'Michael Nirko',
    role: 'Full-Stack \u0026 AI Developer',
    phone: '052-827-7544',
    email: 'michael.nirko@email.com',
    location: 'רמת גן, ישראל',
    avatar: 'MN',
    color: 'from-cyan-600 to-blue-600',
    skills: ['React / Next.js', 'Node.js / Python', 'AI / ML', 'DevOps'],
    icon: Cpu,
  },
]

export default function TeamSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="team" className="relative py-24 bg-gray-50 dark:bg-black overflow-hidden transition-colors duration-300">
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
            הצוות שלנו
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            שני שותפים, <span className="gradient-text">מספר אחד</span> בפיתוח
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            שילוב של ניסיון, יצירתיות ומחויבות לתוצאות. יחד אנחנו מספקים פתרונות טכנולוגיים מקיפים.
          </p>
        </motion.div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${partner.color} rounded-2xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              <div className="relative h-full glass rounded-2xl p-8 border border-gray-200 dark:border-white/10 hover:border-purple-500/30 transition-all duration-300">
                {/* Avatar & Icon */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${partner.color} flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
                    {partner.avatar}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{partner.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{partner.nameEn}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <partner.icon className="w-4 h-4 text-purple-500 dark:text-cyan-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{partner.role}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {partner.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <a
                    href={`tel:${partner.phone.replace(/-/g, '')}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group/contact"
                  >
                    <Phone className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover/contact:text-purple-600 dark:group-hover/contact:text-cyan-400 transition-colors">{partner.phone}</span>
                  </a>
                  <a
                    href={`mailto:${partner.email}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group/contact"
                  >
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover/contact:text-purple-600 dark:group-hover/contact:text-cyan-400 transition-colors">{partner.email}</span>
                  </a>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{partner.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
