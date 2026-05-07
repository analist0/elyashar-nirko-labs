import * as fs from 'fs'
import * as path from 'path'

const DOMAIN = 'https://elyasharlabs.com'
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')
const PUBLIC_DIR = path.join(process.cwd(), 'public')
const SCHEMA_DIR = path.join(PUBLIC_DIR, 'schema')

interface Post {
  slug: string
  title: string
  excerpt: string
  date: string
  tags?: string[]
  category?: string
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function getAllPosts(): Post[] {
  try {
    if (!fs.existsSync(POSTS_DIR)) return []
    return fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith('.json') && f !== 'topics.json')
      .map((f) => {
        const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8')
        const data = JSON.parse(raw)
        return { ...data, slug: data.slug || f.replace('.json', '') } as Post
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch {
    return []
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
  return d.toISOString().split('T')[0]
}

function generateSitemap(posts: Post[]): string {
  const urls: string[] = []

  urls.push(`  <url>
    <loc>${DOMAIN}/</loc>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>`)

  urls.push(`  <url>
    <loc>${DOMAIN}/blog/</loc>
    <priority>0.9</priority>
    <changefreq>daily</changefreq>
  </url>`)

  for (const post of posts) {
    const lastmod = formatDate(post.date)
    urls.push(`  <url>
    <loc>${DOMAIN}/blog/${post.slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`)
  }

  urls.push(`  <url>
    <loc>${DOMAIN}/admin/</loc>
    <priority>0.3</priority>
  </url>`)

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

function generateRobots(): string {
  return `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${DOMAIN}/sitemap.xml
`
}

function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'ElyasharLabs',
    alternateName: 'יוסף אלישר - ElyasharLabs',
    description:
      'משרת פיתוח AI ו-Full-Stack של יוסף אלישר. בניית אפליקציות AI, אתרי תדמית, מערכות Full-Stack, אוטומציה וייעוץ טכנולוגי ברמת גן ובאזור גוש דן.',
    url: DOMAIN,
    telephone: '+972-58-442-3342',
    email: 'joseph@elyasharlabs.com',
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
    serviceType: [
      'AI Development',
      'Full-Stack Development',
      'Web Development',
      'Automation',
      'Technical Consulting',
    ],
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
    founder: {
      '@type': 'Person',
      name: 'יוסף אלישר',
      jobTitle: 'Full-Stack & AI Developer',
      url: DOMAIN,
    },
    sameAs: [
      'https://github.com/josephelyashar',
      'https://www.linkedin.com/in/josephelyashar',
    ],
  }
}

function generateServicesSchema() {
  const services = [
    {
      name: 'אפליקציות AI',
      description: 'בניית אפליקציות מבוססות בינה מלאכותית — צ׳אטבוטים, עיבוד תמונה, ניתוח טקסט, ומערכות המלצה חכמות.',
      offers: { '@type': 'Offer', priceRange: '₪3,000–₪15,000', priceCurrency: 'ILS' },
    },
    {
      name: 'אתרי תדמית',
      description: 'עיצוב ופיתוח אתרי תדמית מרשימים עם אנימציות מתקדמות, SEO מובנה וחווית משתמש מעולה.',
      offers: { '@type': 'Offer', priceRange: '₪1,500–₪5,000', priceCurrency: 'ILS' },
    },
    {
      name: 'פיתוח Full-Stack',
      description: 'מערכות web מורכבות מקצה לקצה — מבסיס הנתונים דרך ה-API ועד לממשק המשתמש.',
      offers: { '@type': 'Offer', priceRange: '₪5,000–₪25,000', priceCurrency: 'ILS' },
    },
    {
      name: 'אוטומציה',
      description: 'אוטומציה של תהליכים עסקיים — סקריפטים, בוטים, זרימות עבודה וחיבור בין מערכות.',
      offers: { '@type': 'Offer', priceRange: '₪2,000–₪8,000', priceCurrency: 'ILS' },
    },
    {
      name: 'ייעוץ טכנולוגי',
      description: 'ייעוץ אישי לפרויקטים טכנולוגיים — בחירת ארכיטקטורה, טכנולוגיות, ואסטרטגיית פיתוח.',
      offers: { '@type': 'Offer', price: '350', priceUnitText: 'לשעה', priceCurrency: 'ILS' },
    },
    {
      name: 'מערכות AI',
      description: 'מערכות AI מתקדמות — אימון מודלים, אינטגרציה עם LLMs, ופתרונות בינה מלאכותית מותאמים אישית.',
      offers: { '@type': 'Offer', priceRange: '₪8,000–₪30,000', priceCurrency: 'ILS' },
    },
  ]

  return services.map((s) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: { '@type': 'LocalBusiness', name: 'ElyasharLabs', url: DOMAIN },
    areaServed: { '@type': 'Place', name: 'Ramat Gan, Israel' },
    ...s,
  }))
}

function generateFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'כמה עולה לפתח אפליקציית AI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'עלות פיתוח אפליקציית AI נעה בין ₪3,000 ל₪15,000 בהתאם למורכבות הפרויקט, סוג המודל, ודרישות האינטגרציה. אפליקציות צ׳אטבוט פשוטות יעמדו בקצה הנמוך, ואילו מערכות עם עיבוד תמונה או ניתוח טקסט מתקדם ידרשו השקעה גבוהה יותר.',
        },
      },
      {
        '@type': 'Question',
        name: 'כמה זמן לוקח לבנות אתר תדמית מקצועי?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'אתר תדמית מקצועי עם אנימציות, SEO וחווית משתמש מעולה לרוב יסתיים תוך 1–3 שבועות. לוחות הזמנים תלויים בכמות העמודים, דרישות העיצוב, והאינטגרציות הנדרשות.',
        },
      },
      {
        '@type': 'Question',
        name: 'האם ניתן לשלב AI במערכת קיימת?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'בהחלט. ניתן לשלב יכולות AI במערכות קיימות דרך APIs של מודלי שפה (LLMs), שירותי עיבוד תמונה, ומנועי המלצה. האינטגרציה מתבצעת בצורה מודולרית כך שלא נדרש שינוי ארכיטקטוני רדיקלי.',
        },
      },
      {
        '@type': 'Question',
        name: 'מה היתרון של אוטומציה עסקית?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'אוטומציה עסקית חוסכת זמן יקר, מפחיתה טעויות אנוש, ומאפשרת לצוות להתמקד במשימות אסטרטגיות. תהליכים כמו דיווח אוטומטי, סנכרון נתונים, ותגובות ראשוניות ללקוחות הופכים לשקופים ויעילים.',
        },
      },
      {
        '@type': 'Question',
        name: 'אילו טכנולוגיות אתה עובד איתן?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'אני עובד עם מגוון רחב של טכנולוגיות מודרניות: React, Next.js, TypeScript, Node.js, Python, TensorFlow, PyTorch, Flutter, Docker, Kubernetes וענן (AWS, GCP, Azure). הבחירה בטכנולוגיה מתבצעת לפי צרכי הלקוח והפרויקט.',
        },
      },
    ],
  }
}

function generateBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'דף הבית',
        item: `${DOMAIN}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'בלוג',
        item: `${DOMAIN}/blog/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'פוסט',
        item: `${DOMAIN}/blog/post-slug/`,
      },
    ],
  }
}

function main() {
  console.log('Generating SEO files...')

  ensureDir(SCHEMA_DIR)

  const posts = getAllPosts()
  console.log(`Found ${posts.length} posts`)

  const sitemap = generateSitemap(posts)
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf-8')
  console.log('Generated public/sitemap.xml')

  const robots = generateRobots()
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robots, 'utf-8')
  console.log('Generated public/robots.txt')

  const localBusiness = generateLocalBusinessSchema()
  fs.writeFileSync(path.join(SCHEMA_DIR, 'local-business.json'), JSON.stringify(localBusiness, null, 2), 'utf-8')
  console.log('Generated public/schema/local-business.json')

  const services = generateServicesSchema()
  fs.writeFileSync(path.join(SCHEMA_DIR, 'services.json'), JSON.stringify(services, null, 2), 'utf-8')
  console.log('Generated public/schema/services.json')

  const faq = generateFaqSchema()
  fs.writeFileSync(path.join(SCHEMA_DIR, 'faq.json'), JSON.stringify(faq, null, 2), 'utf-8')
  console.log('Generated public/schema/faq.json')

  const breadcrumb = generateBreadcrumbSchema()
  fs.writeFileSync(path.join(SCHEMA_DIR, 'breadcrumb.json'), JSON.stringify(breadcrumb, null, 2), 'utf-8')
  console.log('Generated public/schema/breadcrumb.json')

  console.log('SEO generation complete!')
}

main()
