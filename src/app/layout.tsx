import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '../context/ThemeContext'

export const metadata: Metadata = {
  title: 'Joseph Elyashar | AI & Full-Stack Developer',
  description: 'יוסף אלישר - מומחה AI, פיתוח Full-Stack, בוטים, אוטומציה ופתרונות טכנולוגיים מתקדמים. 058-442-3342',
  keywords: 'AI, Machine Learning, Full-Stack, Python, React, Node.js, Automation, יוסף אלישר',
  openGraph: {
    locale: 'he_IL',
    siteName: 'ElyasharLabs',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
  alternates: {
    canonical: 'https://elyasharlabs.com/',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <body className="bg-black text-white overflow-x-hidden transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
