'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Brain, Cpu } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { name: 'ראשי', href: '/#hero' },
  { name: 'בלוג', href: '/blog' },
  { name: 'פרויקטים', href: '/#projects' },
  { name: 'שירותים', href: '/#services' },
  { name: 'מיומנויות', href: '/#skills' },
  { name: 'צור קשר', href: '/#contact' },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'glass py-3 shadow-lg' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/#hero" className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }}>
                <div className="relative">
                  <Brain className="w-8 h-8 text-purple-500" />
                  <Cpu className="w-4 h-4 text-cyan-400 absolute -bottom-1 -right-1" />
                </div>
                <span className="text-xl font-bold gradient-text">JE</span>
              </motion.div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white transition-colors relative group"
                >
                  <motion.span whileHover={{ scale: 1.1 }} className="inline-block">
                    {item.name}
                  </motion.span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}

              {/* Theme Toggle */}
              <div className="mr-4">
                <ThemeToggle />
              </div>

              <motion.a
                href="tel:0584423342"
                className="btn-primary px-6 py-2 rounded-full text-white font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                דברו איתי
              </motion.a>
            </div>

            {/* Mobile Menu Button + Theme Toggle */}
            <div className="flex items-center gap-3 md:hidden">
              <ThemeToggle />
              <button
                className="text-white"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 glass md:hidden pt-20"
          >
            <div className="flex flex-col items-center gap-6 p-8">
              {navItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-2xl font-medium text-white inline-block"
                  >
                    {item.name}
                  </motion.span>
                </Link>
              ))}
              <motion.a
                href="tel:0584423342"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="btn-primary px-8 py-3 rounded-full text-white font-bold mt-4"
                onClick={() => setIsOpen(false)}
              >
                058-442-3342
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
