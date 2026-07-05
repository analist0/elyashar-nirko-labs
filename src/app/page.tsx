'use client'

import { motion } from 'framer-motion'
import HeroSection from '../../components/HeroSection'
import TeamSection from '../../components/TeamSection'
import StatsSection from '../../components/StatsSection'
import ProjectsSection from '../../components/ProjectsSection'
import ServicesSection from '../../components/ServicesSection'
import SkillsSection from '../../components/SkillsSection'
import ContactSection from '../../components/ContactSection'
import Navigation from '../../components/Navigation'
import TelegramChatWidget from '../../components/TelegramChatWidget'

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Elyashar \u0026 Nirko Labs',
  alternateName: 'יוסף אלישר \u0026 מיכאל נירקו - Elyashar \u0026 Nirko Labs',
  description: 'משרת פיתוח AI ו-Full-Stack של יוסף אלישר ומיכאל נירקו. בניית אפליקציות AI, אתרי תדמית, מערכות Full-Stack, אוטומציה וייעוץ טכנולוגי ברמת גן ובאזור גוש דן.',
  url: 'https://elyashar-nirko.dev',
  telephone: '+972-58-442-3342',
  email: 'contact@elyashar-nirko.dev',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ramat Gan',
    addressRegion: 'Tel Aviv District',
    addressCountry: 'IL',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '32.0684',
    longitude: '34.8248',
  },
  areaServed: {
    '@type': 'Place',
    name: 'Gush Dan',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gush Dan',
      addressCountry: 'IL',
    },
  },
  serviceType: ['AI Development', 'Full-Stack Development', 'Web Development', 'Automation', 'Technical Consulting'],
  priceRange: '₪₪₪',
  currenciesAccepted: 'ILS',
  paymentAccepted: 'Cash, Credit Card, Bank Transfer, PayPal',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '09:00',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Friday',
      opens: '09:00',
      closes: '14:00',
    },
  ],
  founder: [
    {
      '@type': 'Person',
      name: 'יוסף אלישר',
      jobTitle: 'Full-Stack \u0026 AI Developer',
      url: 'https://elyashar-nirko.dev',
      telephone: '+972-58-442-3342',
    },
    {
      '@type': 'Person',
      name: 'מיכאל נירקו',
      jobTitle: 'Full-Stack \u0026 AI Developer',
      url: 'https://elyashar-nirko.dev',
      telephone: '+972-52-827-7544',
    },
  ],
  sameAs: [
    'https://github.com/josephelyashar',
    'https://www.linkedin.com/in/josephelyashar',
  ],
}

const servicesJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: { '@type': 'LocalBusiness', name: 'Elyashar \u0026 Nirko Labs', url: 'https://elyashar-nirko.dev' },
    areaServed: { '@type': 'Place', name: 'Ramat Gan, Israel' },
    name: 'אפליקציות AI',
    description: 'בניית אפליקציות מבוססות בינה מלאכותית — צ\'אטבוטים, עיבוד תמונה, ניתוח טקסט, ומערכות המלצה חכמות.',
    offers: { '@type': 'Offer', priceRange: '₪3,000–₪15,000', priceCurrency: 'ILS' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: { '@type': 'LocalBusiness', name: 'Elyashar \u0026 Nirko Labs', url: 'https://elyashar-nirko.dev' },
    areaServed: { '@type': 'Place', name: 'Ramat Gan, Israel' },
    name: 'אתרי תדמית',
    description: 'עיצוב ופיתוח אתרי תדמית מרשימים עם אנימציות מתקדמות, SEO מובנה וחווית משתמש מעולה.',
    offers: { '@type': 'Offer', priceRange: '₪1,500–₪5,000', priceCurrency: 'ILS' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: { '@type': 'LocalBusiness', name: 'Elyashar \u0026 Nirko Labs', url: 'https://elyashar-nirko.dev' },
    areaServed: { '@type': 'Place', name: 'Ramat Gan, Israel' },
    name: 'פיתוח Full-Stack',
    description: 'מערכות web מורכבות מקצה לקצה — מבסיס הנתונים דרך ה-API ועד לממשק המשתמש.',
    offers: { '@type': 'Offer', priceRange: '₪5,000–₪25,000', priceCurrency: 'ILS' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: { '@type': 'LocalBusiness', name: 'Elyashar \u0026 Nirko Labs', url: 'https://elyashar-nirko.dev' },
    areaServed: { '@type': 'Place', name: 'Ramat Gan, Israel' },
    name: 'אוטומציה',
    description: 'אוטומציה של תהליכים עסקיים — סקריפטים, בוטים, זרימות עבודה וחיבור בין מערכות.',
    offers: { '@type': 'Offer', priceRange: '₪2,000–₪8,000', priceCurrency: 'ILS' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: { '@type': 'LocalBusiness', name: 'Elyashar \u0026 Nirko Labs', url: 'https://elyashar-nirko.dev' },
    areaServed: { '@type': 'Place', name: 'Ramat Gan, Israel' },
    name: 'ייעוץ טכנולוגי',
    description: 'ייעוץ אישי לפרויקטים טכנולוגיים — בחירת ארכיטקטורה, טכנולוגיות, ואסטרטגיית פיתוח.',
    offers: { '@type': 'Offer', price: '350', priceUnitText: 'לשעה', priceCurrency: 'ILS' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: { '@type': 'LocalBusiness', name: 'Elyashar \u0026 Nirko Labs', url: 'https://elyashar-nirko.dev' },
    areaServed: { '@type': 'Place', name: 'Ramat Gan, Israel' },
    name: 'מערכות AI',
    description: 'מערכות AI מתקדמות — אימון מודלים, אינטגרציה עם LLMs, ופתרונות בינה מלאכותית מותאמים אישית.',
    offers: { '@type': 'Offer', priceRange: '₪8,000–₪30,000', priceCurrency: 'ILS' },
  },
]

const combinedJsonLd = [localBusinessJsonLd, ...servicesJsonLd]

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedJsonLd) }}
      />

      <main className="min-h-screen bg-black">
        {/* SEO: visually hidden H1 and local context for crawlers */}
        <section className="sr-only" aria-label="מידע עסקי">
          <h1>יוסף אלישר \u0026 מיכאל נירקו — מפתחי Full-Stack ו-AI ברמת גן | Elyashar \u0026 Nirko Labs</h1>
          <p>
            Elyashar \u0026 Nirko Labs מציע שירותי פיתוח AI, בניית אתרי תדמית, מערכות Full-Stack, אוטומציה עסקית
            וייעוץ טכנולוגי באזור רמת גן וגוש דן. יוסף אלישר ומיכאל נירקו — מומחים בבינה מלאכותית, React,
            Node.js, Python וטכנולוגיות ענן. צרו קשר: 058-442-3342 | 052-827-7544.
          </p>
        </section>

        <Navigation />
        <HeroSection />
        <TeamSection />
        <StatsSection />
        <ProjectsSection />
        <ServicesSection />
        <SkillsSection />
        <ContactSection />
        <TelegramChatWidget />
      </main>
    </>
  )
}
