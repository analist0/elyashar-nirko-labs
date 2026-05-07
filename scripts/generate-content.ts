#!/usr/bin/env ts-node
/**
 * Ultra Content Machine — Professional Tech Blog Generator
 * Generates ultra-detailed Hebrew guides with multiple images, code blocks,
 * responsive components, analytics, and top-tier SEO.
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { ollamaChatGenerate } from './ollama-ai.js'
import { cfImageGenerate } from './cloudflare-ai.js'
import { generateAllArticleImages, type SectionImageConfig } from './generate-images.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Interfaces ─────────────────────────────────────────────────────────────

interface GitHubRepo {
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  language: string
  topics: string[]
  owner: { login: string; avatar_url: string }
  created_at: string
  updated_at: string
}

interface ArticleSection {
  id: string
  title: string
  html: string
  imagePrompt: string
  imageUrl?: string
}

interface BlogPost {
  slug: string
  title: string
  content: string
  sections: ArticleSection[]
  excerpt: string
  date: string
  readTime: string
  tags: string[]
  category: string
  githubUrl: string
  source: string
  imageUrl?: string
  author: string
  ogTitle: string
  ogDescription: string
  ogImage?: string
  keywords: string[]
  canonicalUrl: string
  jsonLd: object
  wordCount: number
}

interface TopicRecord {
  topics: string[]
  writtenAt: string
  slug: string
}

// ── Config ─────────────────────────────────────────────────────────────────

const CONFIG = {
  POSTS_DIR: path.join(__dirname, '..', 'content', 'posts'),
  TOPICS_FILE: path.join(__dirname, '..', 'content', 'topics.json'),
  IMAGES_DIR: path.join(__dirname, '..', 'public', 'images', 'generated'),
  GITHUB_API: 'https://api.github.com/search/repositories',
  AUTHOR: 'יוסף אלישר',
  SITE_URL: 'https://elyasharlabs.com',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function ensureDirs() {
  if (!fs.existsSync(CONFIG.POSTS_DIR)) fs.mkdirSync(CONFIG.POSTS_DIR, { recursive: true })
  if (!fs.existsSync(CONFIG.IMAGES_DIR)) fs.mkdirSync(CONFIG.IMAGES_DIR, { recursive: true })
}

function loadTopics(): TopicRecord[] {
  try {
    if (fs.existsSync(CONFIG.TOPICS_FILE)) return JSON.parse(fs.readFileSync(CONFIG.TOPICS_FILE, 'utf-8'))
  } catch {}
  return []
}

function saveTopics(topics: TopicRecord[]) {
  fs.writeFileSync(CONFIG.TOPICS_FILE, JSON.stringify(topics, null, 2))
}

function isTopicWritten(topic: string, topics: TopicRecord[]): boolean {
  const normalized = topic.toLowerCase().trim()
  return topics.some(r => r.topics.some(t => t.toLowerCase().trim() === normalized))
}

async function fetchTrendingRepos(): Promise<GitHubRepo[]> {
  const queries = [
    'stars:>5000 language:typescript created:>2025-01-01',
    'stars:>5000 language:python created:>2025-01-01',
    'stars:>3000 language:rust created:>2025-01-01',
    'stars:>3000 language:go created:>2025-01-01',
    'topic:ai stars:>3000',
    'topic:machine-learning stars:>2000',
    'topic:web-framework stars:>2000',
    'topic:devops stars:>2000',
    'topic:automation stars:>2000',
  ]
  const all: GitHubRepo[] = []
  const token = process.env.GITHUB_TOKEN

  for (const q of queries) {
    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Ultra-Content-Machine',
      }
      if (token) headers.Authorization = `token ${token}`

      const res = await fetch(
        `${CONFIG.GITHUB_API}?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=8`,
        { headers }
      )
      if (!res.ok) { console.warn(`GitHub error ${res.status} for "${q}"`); continue }
      const data = await res.json()
      if (data.items) all.push(...data.items)
      await new Promise(r => setTimeout(r, 800))
    } catch (e) { console.error(`Fetch error for "${q}":`, e) }
  }

  const unique = new Map<string, GitHubRepo>()
  all.forEach(r => unique.set(r.full_name, r))
  return Array.from(unique.values())
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 15)
}

// ── Content Generation ─────────────────────────────────────────────────────

function buildContentPrompt(repo: GitHubRepo): string {
  const { name, description, stargazers_count, language, topics, html_url } = repo
  return `אתה כותב טכנולוגי בכיר ברמה של Smashing Magazine + CSS-Tricks.

כתוב מדריך מקיף ב-HTML בלבד (אין Markdown) על "${name}" — ${stargazers_count.toLocaleString()} כוכבים ב-GitHub.

מידע: ${description || 'כלי פופולרי'} | שפה: ${language || 'Multi'} | נושאים: ${topics.join(', ')} | לינק: ${html_url}

מבנה חובה — החזר HTML מלא:

<section id="intro">
<h2>מה זה ${name} ולמה ${stargazers_count.toLocaleString()} מפתחים כבר משתמשים בו?</h2>
3-4 פסקאות מעמיקות. הסבר את הכלי, ההיסטוריה, למה הוא טרנד עכשיו, ומה מיוחד בו שלא כולם יודעים. השתמש ב-bold, lists, tips.
</section>

<section id="stats">
<h2>סטטיסטיקות וביצועים — המספרים לא משקרים</h2>
טבלת השוואה HTML עם table/tr/td. השווה ${name} למתחרים הכי פופולריים.
</section>

<section id="prerequisites">
<h2>דרישות מקדימות</h2>
רשימת ul>li עם אייקונים — כל דרישה עם גרסה מדויקת.
</section>

<section id="installation">
<h2>התקנה שלב אחר שלב — 2026 Edition</h2>
4-6 שלבים. כל שלב: כותרת h3, הסבר מעמיק, קוד bash מלא ב-<pre><code class="language-bash">, הסבר מה כל פקודה עושה.
</section>

<section id="components">
<h2>רכיבים מודרניים — Responsive ב-2026</h2>
3 רכיבים מלאים: (1) קומפוננטה React/TypeScript עם hooks, (2) CSS עם Grid + Flexbox + media queries, (3) דוגמת שימוש. כל קוד ב-<pre><code class="language-tsx"> או <pre><code class="language-css">.
</section>

<section id="usage">
<h2>דוגמאות שימוש מתקדמות — Patterns נדירים</h2>
4-5 דוגמאות קוד אמיתיות. כל דוגמה: תיאור הבעיה, קוד הפתרון, הסבר שורה אחרי שורה.
</section>

<section id="analytics">
<h2>אנליטיקס ומדדים</h2>
קוד TypeScript לאנליטיקס: מדדי ביצועים, health checks, logging, dashboards. כל קוד ב-<pre><code class="language-typescript">.
</section>

<section id="advanced">
<h2>טיפים נדירים ו-Best Practices</h2>
8-10 טיפים מקצועיים. כל טיפ עם קוד ודוגמה. דברים שלא מופיעים בדוקומנטציה.
</section>

<section id="troubleshooting">
<h2>פתרון בעיות נפוצות + Edge Cases</h2>
6-8 בעיות עם פתרונות מלאים. כל בעיה: תיאור, קוד השגיאה, הסבר, פתרון, קוד מתוקן.
</section>

<section id="conclusion">
<h2>סיכום — למה ${name} שווה את הזמן שלך ב-2026</h2>
סיכום חזק עם CTA. רשימת יתרונות מרכזיים, links למקורות.
</section>

כללי זהב:
- HTML בלבד — אין Markdown, אין CSS מובנה (האתר מעצב אוטומטית)
- כל בלוק קוד ב-<pre><code class="language-XXX">
- לפחות 2500 מילים
- קוד אמיתי 100%
- השתמש ב: tables, lists, tips (class="tip"), warnings (class="warning"), highlights (class="highlight")
- כתוב בעברית תקנית, חמה ומקצועית
- תן זווית ייחודית שלא מופיעה במדריכים אחרים`}

function parseSections(html: string): ArticleSection[] {
  const sections: ArticleSection[] = []
  const sectionRegex = /<section\s+id="([^"]+)">([\s\S]*?)<\/section>/g
  let match

  while ((match = sectionRegex.exec(html)) !== null) {
    const id = match[1]
    const content = match[2].trim()

    // Extract title from h2
    const titleMatch = content.match(/<h2>([<\s\S]*?)<\/h2>/)
    const title = titleMatch ? titleMatch[1].replace(/<[^>>]*>/g, '').trim() : id

    // Remove h2 from html since we handle title separately
    const htmlWithoutTitle = content.replace(/<h2>[<\s\S]*?<\/h2>/, '').trim()

    const imagePrompts: Record<string, string> = {
      intro: `Abstract tech visualization of ${id}, code flowing, digital circuits, dark purple cyan gradient`,
      stats: `Data visualization chart, bar graphs, performance metrics, modern dashboard, dark theme`,
      prerequisites: `Developer workspace setup, monitors, code editor, terminal, minimalist illustration`,
      installation: `Terminal window showing installation commands, dark background, green text, IDE aesthetic`,
      components: `Responsive web design components, mobile tablet desktop, modern UI cards, grid system`,
      usage: `Code snippets floating, syntax highlighting, programming patterns, abstract code art`,
      analytics: `Analytics dashboard, charts and graphs, monitoring metrics, dark theme UI`,
      advanced: `Lightbulb ideas, creative solutions, innovation concept, tech breakthrough`,
      troubleshooting: `Bug fixing, debugging tools, magnifying glass over code, problem solving`,
      conclusion: `Success checkmark, rocket launch, achievement celebration, modern tech victory`,
    }

    sections.push({
      id,
      title,
      html: htmlWithoutTitle,
      imagePrompt: imagePrompts[id] || `${id} tech illustration`,
    })
  }

  return sections
}

function assembleHtml(sections: ArticleSection[], repo: GitHubRepo): string {
  const parts = sections.map(s => {
    const imgHtml = s.imageUrl
      ? `<div class="section-image"><img src="${s.imageUrl}" alt="${s.title}" loading="lazy" /></div>`
      : ''
    return `
<section id="${s.id}" class="article-section">
  <h2 class="section-title">${s.title}</h2>
  ${imgHtml}
  <div class="section-content">${s.html}</div>
</section>`
  })

  return `
<article class="ultra-guide" data-repo="${repo.name}" data-stars="${repo.stargazers_count}">
<div class="article-meta">
  <span class="meta-tag">⭐ ${repo.stargazers_count.toLocaleString()} Stars</span>
  <span class="meta-tag">🔤 ${repo.language || 'Multi-language'}</span>
  <span class="meta-tag">📅 ${new Date(repo.created_at).toLocaleDateString('he-IL')}</span>
</div>
${parts.join('\n')}
<div class="article-footer">
  <p>📚 פוסט זה נכתב אוטומטית על ידי <strong>מכונת התוכן Ultra Content Machine</strong> של יוסף אלישר</p>
  <p>⭐ מקור: <a href="${repo.html_url}" target="_blank" rel="noopener">${repo.full_name}</a> | ${repo.stargazers_count.toLocaleString()} כוכבים</p>
</div>
</article>
`.trim()
}

function buildJsonLd(post: BlogPost, repo: GitHubRepo): object {
  const kws = (post.keywords || post.tags || []).join(', ')
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Person', name: CONFIG.AUTHOR, url: CONFIG.SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'ElyasharLabs',
      logo: { '@type': 'ImageObject', url: `${CONFIG.SITE_URL}/logo.png` },
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': post.canonicalUrl },
    image: post.ogImage || post.imageUrl,
    keywords: kws,
    articleSection: post.category,
    about: {
      '@type': 'SoftwareApplication',
      name: repo.name,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Cross-platform',
      softwareVersion: 'Latest',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        reviewCount: String(repo.stargazers_count),
      },
    },
  }
}

async function generateUltraGuide(repo: GitHubRepo): Promise<BlogPost> {
  const slug = `${repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
  const date = new Date().toISOString()

  // 1. Generate content via Ollama Pro
  console.log('🤖 Generating ultra-guide via Ollama Pro...')
  let rawHtml = ''
  let title = `${repo.name}: המדריך המקיף להתקנה ושימוש מקצועי`
  let excerpt = `מדריך מקיף ומפורט על ${repo.name} — ${repo.description || 'כלי פופולרי בקוד פתוח'}. כולל התקנה שלב אחר שלב, רכיבים רספונסיביים, אנליטיקס, טיפים נדירים, ודוגמאות קוד אמיתיות.`

  try {
    const systemMsg = {
      role: 'system',
      content: 'אתה כותב טכנולוגי בכיר ישראלי. אתה כותב ב-HTML בלבד. אין Markdown. תן תוכן מעמיק ומקורי.',
    }
    const userMsg = { role: 'user', content: buildContentPrompt(repo) }

    rawHtml = await ollamaChatGenerate([systemMsg, userMsg], { numPredict: 6000 })

    // Try to extract title from first h2
    const titleMatch = rawHtml.match(/<h2>([^<]+)<\/h2>/)
    if (titleMatch) title = titleMatch[1].trim()

    console.log(`✅ Content generated: ${rawHtml.length} chars`)
  } catch (err) {
    console.warn('⚠️  Ollama failed, using fallback:', (err as Error).message.slice(0, 120))
    rawHtml = buildFallbackHtml(repo)
  }

  // 2. Parse sections
  let sections = parseSections(rawHtml)
  if (sections.length === 0) {
    sections = [{
      id: 'content',
      title: 'תוכן מקיף',
      html: rawHtml,
      imagePrompt: `${repo.name} tech visualization`,
    }]
  }

  // 3. Generate all article images (featured + per-section)
  const sectionConfigs: SectionImageConfig[] = sections.map(s => ({
    id: s.id,
    title: s.title,
    prompt: s.imagePrompt,
  }))

  const { featured, og, sections: sectionImages } = await generateAllArticleImages(
    title,
    getCategory(repo),
    [repo.language, ...repo.topics.slice(0, 5), 'GitHub', 'מדריך', '2026', 'Open Source'].filter(Boolean) as string[],
    slug,
    sectionConfigs
  )

  for (const sec of sections) {
    if (sectionImages[sec.id]) {
      sec.imageUrl = sectionImages[sec.id]
    }
  }

  const featuredImage = featured
  const ogImage = og

  // 5. Assemble full HTML
  const fullHtml = assembleHtml(sections, repo)
  const wordCount = fullHtml.split(/\s+/).length

  // 6. Build post
  const tags = [repo.language, ...repo.topics.slice(0, 5), 'GitHub', 'מדריך', '2026', 'Open Source'].filter(Boolean) as string[]
  const category = getCategory(repo)
  const canonicalUrl = `${CONFIG.SITE_URL}/blog/${slug}/`

  const post: BlogPost = {
    slug,
    title,
    content: fullHtml,
    sections,
    excerpt,
    date,
    readTime: `${Math.ceil(wordCount / 200)} דקות קריאה`,
    tags,
    category,
    githubUrl: repo.html_url,
    source: 'github-trending',
    imageUrl: featuredImage,
    author: CONFIG.AUTHOR,
    ogTitle: title,
    ogDescription: excerpt,
    ogImage: ogImage,
    keywords: [...tags, repo.name, 'התקנה', 'מדריך בעברית', category],
    canonicalUrl,
    jsonLd: {},
    wordCount,
  }

  post.jsonLd = buildJsonLd(post, repo)
  return post
}

// ── Fallback ────────────────────────────────────────────────────────────────

function buildFallbackHtml(repo: GitHubRepo): string {
  const { name, description, html_url, stargazers_count, language } = repo
  return `
<section id="intro">
<h2>מה זה ${name}?</h2>
<p><strong>${name}</strong> הוא ${description || 'כלי פופולרי בקוד פתוח'} עם ${stargazers_count.toLocaleString()} כוכבים ב-GitHub.</p>
</section>
<section id="installation">
<h2>התקנה</h2>
<pre><code class="language-bash">git clone ${html_url}.git
cd ${name}</code></pre>
</section>
<section id="usage">
<h2>דוגמאות שימוש</h2>
<pre><code class="language-${(language || 'bash').toLowerCase()}">${name.toLowerCase()} --help</code></pre>
</section>
`
}

// ── Category ───────────────────────────────────────────────────────────────

function getCategory(repo: GitHubRepo): string {
  const map: Record<string, string> = {
    ai: 'בינה מלאכותית', 'machine-learning': 'Machine Learning',
    'artificial-intelligence': 'בינה מלאכותית', automation: 'אוטומציה',
    devops: 'DevOps', security: 'אבטחת מידע', web: 'פיתוח Web',
    'web-development': 'פיתוח Web', cli: 'כלי CLI',
    database: 'בסיסי נתונים', api: 'API Development',
    cloud: 'ענן ותשתיות', docker: 'DevOps', kubernetes: 'DevOps',
  }
  for (const t of repo.topics) {
    const cat = map[t.toLowerCase()]
    if (cat) return cat
  }
  const langMap: Record<string, string> = {
    Python: 'פיתוח Python', TypeScript: 'פיתוח Web',
    JavaScript: 'פיתוח Web', Go: 'פיתוח Go',
    Rust: 'פיתוח Rust', Java: 'פיתוח Java',
  }
  return langMap[repo.language || ''] || 'טכנולוגיה'
}

// ── Save ────────────────────────────────────────────────────────────────────

function savePost(post: BlogPost) {
  const filepath = path.join(CONFIG.POSTS_DIR, `${post.slug}.json`)
  fs.writeFileSync(filepath, JSON.stringify(post, null, 2))
  console.log(`💾 Post saved: ${filepath}`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Ultra Content Machine — Starting...\n')
  console.log('='.repeat(60))

  ensureDirs()
  const written = loadTopics()
  console.log(`📚 Previously written: ${written.length} topics`)

  console.log('\n🔍 Fetching trending repositories...')
  const repos = await fetchTrendingRepos()
  console.log(`✅ Found ${repos.length} repositories`)

  let selected: GitHubRepo | null = null
  for (const repo of repos) {
    const topics = [repo.name, repo.language, ...repo.topics].filter(Boolean)
    if (!topics.some(t => isTopicWritten(t, written))) {
      selected = repo
      break
    }
  }

  if (!selected) {
    console.log('\n⚠️  All topics already written!')
    return
  }

  console.log('\n' + '='.repeat(60))
  console.log('📝 SELECTED REPOSITORY:')
  console.log('='.repeat(60))
  console.log(`   Name: ${selected.full_name}`)
  console.log(`   ⭐ Stars: ${selected.stargazers_count.toLocaleString()}`)
  console.log(`   🏷️  Language: ${selected.language || 'N/A'}`)
  console.log(`   📅 Created: ${new Date(selected.created_at).toLocaleDateString('he-IL')}`)
  console.log(`   🔗 URL: ${selected.html_url}`)
  console.log('='.repeat(60))

  console.log('\n✍️  Generating ultra-guide...')
  const post = await generateUltraGuide(selected)

  console.log('\n🖼️  Images:')
  console.log(`   Featured: ${post.imageUrl || '❌'}`)
  post.sections.forEach((s, i) => {
    console.log(`   Section ${i + 1} (${s.id}): ${s.imageUrl || '❌'}`)
  })

  console.log('\n💾 Saving...')
  savePost(post)

  const newRecord: TopicRecord = {
    topics: [selected.name, selected.language, ...selected.topics].filter(Boolean) as string[],
    writtenAt: new Date().toISOString(),
    slug: post.slug,
  }
  written.push(newRecord)
  saveTopics(written)

  console.log('\n' + '='.repeat(60))
  console.log('✅ ULTRA GUIDE GENERATED!')
  console.log('='.repeat(60))
  console.log(`   📄 Title: ${post.title}`)
  console.log(`   🔗 Slug: ${post.slug}`)
  console.log(`   📊 Category: ${post.category}`)
  console.log(`   📝 Words: ${post.wordCount.toLocaleString()}`)
  console.log(`   ⏱️  Read time: ${post.readTime}`)
  console.log(`   🏷️  Tags: ${post.tags.slice(0, 5).join(', ')}`)
  console.log(`   🖼️  Images: ${post.sections.filter(s => s.imageUrl).length}/${post.sections.length} + featured`)
  console.log(`   👤 Author: ${post.author}`)
  console.log(`   🔗 Canonical: ${post.canonicalUrl}`)
  console.log('='.repeat(60))
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  main().catch(console.error)
}

export { main, fetchTrendingRepos, generateUltraGuide }
