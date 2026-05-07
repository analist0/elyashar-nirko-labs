#!/usr/bin/env ts-node
/**
 * Multi-Image Generator — Cloudflare Workers AI (FLUX.1 schnell)
 * Generates a dedicated illustration for EVERY section of an article:
 * intro, installation, components, usage, tips, conclusion
 * Plus featured hero image and OG social card.
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { cfImageGenerate, cfGenerateAndSaveImage } from './cloudflare-ai.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface SectionImageConfig {
  id: string
  title: string
  prompt?: string
}

interface ImageConfig {
  width: number
  height: number
  style: 'modern' | 'minimal' | 'colorful' | 'dark'
}

const DEFAULT_CONFIG: ImageConfig = { width: 1024, height: 576, style: 'modern' }

const STYLE_SUFFIX: Record<string, string> = {
  modern: 'dark background, purple to cyan gradient accents, floating geometric shapes, clean minimalist digital art, no text',
  minimal: 'white background, simple geometric shapes, monochrome with cyan accent, elegant and clean',
  colorful: 'vibrant gradient, dynamic composition, bold colors, energetic and eye-catching',
  dark: 'dark theme, neon cyan and purple, cyberpunk aesthetic, high contrast, futuristic',
}

function buildPrompt(base: string, style: string): string {
  return `${base}, ${STYLE_SUFFIX[style] || STYLE_SUFFIX.modern}, high quality 4k illustration, no watermark`
}

function pollinationsFallback(title: string, category: string, keywords: string[]): string {
  const prompt = encodeURIComponent(
    `Professional tech blog header for "${title}", ${category}, ${keywords.slice(0, 3).join(', ')}, ` +
    `dark gradient background purple to cyan, abstract code elements, minimalist digital art`
  )
  return `https://image.pollinations.ai/prompt/${prompt}?width=1200&height=630&nologo=true&seed=${Date.now()}`
}

/* ─── Per-Section Image Prompts ─── */

const SECTION_PROMPTS: Record<string, (title: string, topic: string) => string> = {
  intro: (title, topic) =>
    `Abstract tech visualization of ${topic}, code flowing through digital circuits, futuristic dark purple cyan gradient, modern minimalist digital art`,
  stats: (title, topic) =>
    `Data visualization dashboard, bar charts and performance metrics, modern analytics UI, dark theme with cyan and purple highlights`,
  prerequisites: (title, topic) =>
    `Developer workspace setup, multiple monitors showing code editor and terminal, minimalist illustration, dark theme`,
  installation: (title, topic) =>
    `Terminal window showing installation commands, dark background with green glowing text, IDE aesthetic, command line interface`,
  components: (title, topic) =>
    `Responsive web design components, mobile tablet and desktop screens, modern UI cards with grid layout, dark theme`,
  usage: (title, topic) =>
    `Code snippets floating in space, syntax highlighting glow, programming patterns visualized, abstract code art, dark background`,
  analytics: (title, topic) =>
    `Analytics dashboard with charts and graphs, real-time monitoring metrics, dark theme UI with neon accents`,
  advanced: (title, topic) =>
    `Lightbulb with creative solutions, innovation concept, tech breakthrough visualization, glowing ideas, dark purple background`,
  troubleshooting: (title, topic) =>
    `Bug fixing and debugging, magnifying glass over code, problem solving visualization, developer tools, dark theme`,
  tips: (title, topic) =>
    `Lightbulb with creative solutions, innovation concept, tech breakthrough visualization, glowing ideas, dark purple background`,
  conclusion: (title, topic) =>
    `Success checkmark and rocket launch, achievement celebration, modern tech victory, dark gradient purple to cyan`,
}

/* ─── Core Image Generation ─── */

export async function generateSectionImage(
  config: SectionImageConfig,
  slug: string,
  style: ImageConfig['style'] = 'modern'
): Promise<string | null> {
  const promptBuilder = SECTION_PROMPTS[config.id] || SECTION_PROMPTS.tips
  const basePrompt = config.prompt || promptBuilder(config.title, slug)
  const fullPrompt = buildPrompt(basePrompt, style)

  try {
    const filename = `${slug}-section-${config.id}`
    const localPath = await cfGenerateAndSaveImage(fullPrompt, filename)
    if (localPath) return localPath
  } catch (err) {
    console.warn(`CF section image gen failed for "${config.id}":`, err)
  }

  // Fallback to Pollinations
  const fallbackPrompt = encodeURIComponent(
    `${basePrompt}, dark gradient background purple to cyan, minimalist digital art`
  )
  return `https://image.pollinations.ai/prompt/${fallbackPrompt}?width=1024&height=576&nologo=true&seed=${Date.now()}`
}

export async function generateSectionImages(
  sections: SectionImageConfig[],
  slug: string,
  style: ImageConfig['style'] = 'modern'
): Promise<Record<string, string>> {
  const results: Record<string, string> = {}

  console.log(`Generating ${sections.length} section images for "${slug}"...`)
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i]
    try {
      const url = await generateSectionImage(sec, slug, style)
      if (url) {
        results[sec.id] = url
        console.log(`  Section ${i + 1}/${sections.length}: "${sec.id}" -> image ready`)
      }
    } catch (e) {
      console.log(`  Section ${i + 1}/${sections.length}: "${sec.id}" -> image error`)
    }
    await new Promise(r => setTimeout(r, 400))
  }

  return results
}

export async function generateFeaturedImage(
  title: string,
  category: string,
  tags: string[],
  slug: string,
  config: Partial<ImageConfig> = {}
): Promise<string> {
  const { style } = { ...DEFAULT_CONFIG, ...config }
  const prompt = buildPrompt(
    `Professional tech blog header for "${title}", category ${category}, keywords: ${tags.slice(0, 3).join(', ')}. ` +
    `Tech-themed illustration with code visualization, abstract circuits`,
    style
  )

  try {
    const localPath = await cfGenerateAndSaveImage(prompt, slug)
    if (localPath) return localPath
  } catch (err) {
    console.warn('CF featured image gen failed, using Pollinations fallback:', err)
  }

  return pollinationsFallback(title, category, tags)
}

export async function generateOGImage(
  title: string,
  slug: string,
  author = 'יוסף אלישר'
): Promise<string> {
  const prompt = buildPrompt(
    `Social media card illustration for tech article "${title}" by ${author}. ` +
    `Bold visual, professional tech blog aesthetic`,
    'dark'
  )

  try {
    const localPath = await cfGenerateAndSaveImage(prompt, `og-${slug}`)
    if (localPath) return localPath
  } catch (err) {
    console.warn('CF OG image gen failed:', err)
  }

  return pollinationsFallback(title, 'social', [])
}

/* ─── All-in-One Article Image Pack ─── */

export async function generateAllArticleImages(
  title: string,
  category: string,
  tags: string[],
  slug: string,
  sections: SectionImageConfig[],
  config: Partial<ImageConfig> = {}
): Promise<{
  featured: string
  og: string
  sections: Record<string, string>
}> {
  console.log('\n🎨 Generating complete image pack...')

  const featured = await generateFeaturedImage(title, category, tags, slug, config)
  console.log(`  Featured: ${featured}`)

  const og = await generateOGImage(title, slug)
  console.log(`  OG image: ${og}`)

  const sectionImages = await generateSectionImages(sections, slug, config.style || 'modern')
  console.log(`  Sections: ${Object.keys(sectionImages).length}/${sections.length} images generated`)

  return { featured, og, sections: sectionImages }
}

/* ─── Utility ─── */

export async function downloadImage(url: string, filename: string): Promise<string | null> {
  const imagesDir = path.join(__dirname, '..', 'public', 'images', 'generated')
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })

  const filepath = path.join(imagesDir, filename)
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    fs.writeFileSync(filepath, Buffer.from(await res.arrayBuffer()))
    return `/images/generated/${filename}`
  } catch (err) {
    console.error('downloadImage failed:', err)
    return null
  }
}

/* ─── Test ─── */
async function main() {
  console.log('Multi-Image Generator Test\n')
  const sections: SectionImageConfig[] = [
    { id: 'intro', title: 'Introduction' },
    { id: 'installation', title: 'Installation Guide' },
    { id: 'components', title: 'Modern Components' },
    { id: 'usage', title: 'Usage Examples' },
    { id: 'tips', title: 'Pro Tips' },
    { id: 'conclusion', title: 'Conclusion' },
  ]

  const result = await generateAllArticleImages(
    'Docker: The Complete Guide',
    'DevOps',
    ['docker', 'containers', 'devops'],
    'test-docker-multi',
    sections
  )

  console.log('\nResults:')
  console.log('Featured:', result.featured)
  console.log('OG:', result.og)
  console.log('Sections:', result.sections)
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) main().catch(console.error)
