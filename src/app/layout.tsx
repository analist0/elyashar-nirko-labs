import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '../context/ThemeContext'

export const metadata: Metadata = {
  title: 'Elyashar & Nirko | AI & Full-Stack Development Partners',
  description: 'יוסף אלישר ומיכאל נירקו - צוות פיתוח AI ו-Full-Stack מוביל. בניית אפליקציות AI, אתרי תדמית, מערכות Full-Stack, אוטומציה וייעוץ טכנולוגי.',
  keywords: 'AI, Machine Learning, Full-Stack, Python, React, Node.js, Automation, יוסף אלישר, מיכאל נירקו, Elyashar Nirko',
  openGraph: {
    locale: 'he_IL',
    siteName: 'Elyashar & Nirko Labs',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
  alternates: {
    canonical: 'https://elyashar-nirko.dev/',
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
