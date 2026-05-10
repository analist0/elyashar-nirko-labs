#!/usr/bin/env tsx
/**
 * Image Generation Pipeline — fal.ai FLUX (primary) + Cloudflare Workers AI (fallback)
 * Generates professional images for blog posts with enterprise-grade quality.
 * Version 2.0 — Enhanced with retry logic, model fallback, and comprehensive error handling.
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import {
  falGenerateImage,
  generateHeroImage as falGenerateHero,
  generateOGImage as falGenerateOG,
  generateBlogImagePack,
} from './fal-ai.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface SectionImageConfig {
  id: string
  title: string
  prompt?: string
}

const STYLE_ENHANCEMENTS: Record<string, string> = {
  modern: 'dark background, purple to cyan gradient accents, floating geometric shapes, clean minimalist digital art, no text, no watermarks',
  minimal: 'white background, simple geometric shapes, monochrome with cyan accent, elegant and clean, no text',
  colorful: 'vibrant gradient, dynamic composition, bold colors, energetic and eye-catching, no text',
  dark: 'dark theme, neon cyan and purple, cyberpunk aesthetic, high contrast, futuristic, no text',
  enterprise: 'dark navy background, subtle grid pattern, professional tech aesthetic, clean lines, no text, premium feel',
  cinematic: 'cinematic lighting, premium modern design, ultra detailed, realistic, clean composition, no text, suitable for tech startup magazine',
}

function buildPrompt(base: string, style: string = 'cinematic'): string {
  return `${base}, ${STYLE_ENHANCEMENTS[style] || STYLE_ENHANCEMENTS.cinematic}, high quality 4K illustration`
}

/* ─── Legacy Pollinations Fallback ─── */
function pollinationsFallback(title: string, category: string, keywords: string[]): string {
  const prompt = encodeURIComponent(
    `Professional tech blog header for "${title}", ${category}, ${keywords.slice(0, 3).join(', ')}, ` +
    `dark gradient background purple to cyan, abstract code elements, minimalist digital art`
  )
  return `https://image.pollinations.ai/prompt/${prompt}?width=1200&height=630&nologo=true&seed=${Date.now()}`
}

function pollinationsSectionFallback(basePrompt: string): string {
  const fallbackPrompt = encodeURIComponent(
    `${basePrompt}, dark gradient background purple to cyan, minimalist digital art`
  )
  return `https://image.pollinations.ai/prompt/${fallbackPrompt}?width=1024&height=576&nologo=true&seed=${Date.now()}`
}

/* ─── Per-Section Prompts (Enterprise Grade) ─── */
const SECTION_PROMPTS: Record<string, (title: string, topic: string) => string> = {
  intro: (title, topic) =>
    `Abstract tech visualization of ${topic}, code flowing through digital circuits, futuristic dark purple cyan gradient, modern minimalist digital art, enterprise software aesthetic`,
  overview: (title, topic) =>
    `High-level architecture diagram of ${topic}, clean dark background, glowing connection lines, modern tech infographic style`,
  prerequisites: (title, topic) =>
    `Developer workspace setup, multiple monitors showing code editor and terminal, minimalist illustration, dark theme, professional environment`,
  installation: (title, topic) =>
    `Terminal window showing installation commands, dark background with green glowing text, IDE aesthetic, command line interface, ${topic} setup`,
  configuration: (title, topic) =>
    `Settings panel and configuration files, modern dark UI, sliders and toggles, ${topic} configuration visualization`,
  components: (title, topic) =>
    `Responsive web design components, mobile tablet and desktop screens, modern UI cards with grid layout, dark theme, ${topic} interface`,
  usage: (title, topic) =>
    `Code snippets floating in space, syntax highlighting glow, programming patterns visualized, abstract code art, dark background, ${topic} implementation`,
  examples: (title, topic) =>
    `Real-world application screenshot mockup, ${topic} in action, modern dashboard interface, dark theme`,
  analytics: (title, topic) =>
    `Analytics dashboard with charts and graphs, real-time monitoring metrics, dark theme UI with neon accents, ${topic} performance`,
  advanced: (title, topic) =>
    `Lightbulb with creative solutions, innovation concept, tech breakthrough visualization, glowing ideas, dark purple background, ${topic} advanced features`,
  troubleshooting: (title, topic) =>
    `Bug fixing and debugging, magnifying glass over code, problem solving visualization, developer tools, dark theme, ${topic} errors`,
  tips: (title, topic) =>
    `Lightbulb with creative solutions, innovation concept, tech breakthrough visualization, glowing ideas, dark purple background, ${topic} pro tips`,
  best_practices: (title, topic) =>
    `Checklist and quality assurance visualization, green checkmarks, professional standards, dark theme, ${topic} best practices`,
  conclusion: (title, topic) =>
    `Success checkmark and rocket launch, achievement celebration, modern tech victory, dark gradient purple to cyan, ${topic} completion`,
}

/* ─── Core Image Generation (fal.ai Primary with Retry) ─── */

export async function generateSectionImage(
  config: SectionImageConfig,
  slug: string,
  style: string = 'cinematic'
): Promise<string | null> {
  const promptBuilder = SECTION_PROMPTS[config.id] || SECTION_PROMPTS.tips
  const basePrompt = config.prompt || promptBuilder(config.title, slug)
  const fullPrompt = buildPrompt(basePrompt, style)

  // Skip fal.ai if configured (e.g. local env where fal.ai doesn't reach)
  if (process.env.SKIP_FAL_AI !== 'true') {
    const filename = `${slug}-section-${config.id}`

    // Primary attempt with flux-pro/v1.1
    let result = await falGenerateImage(fullPrompt, filename, {
      width: 1024,
      height: 576,
      model: 'fal-ai/flux-pro/v1.1',
    })

    if (!result) {
      console.warn(`  [retry] flux-pro/v1.1 failed, trying flux/dev for ${config.id}`)
      result = await falGenerateImage(fullPrompt, filename, {
        width: 1024,
        height: 576,
        model: 'fal-ai/flux/dev',
      })
    }

    if (result) return result
  }

  // Fallback to Pollinations
  console.warn(`  [fallback] Using Pollinations for ${config.id}`)
  return pollinationsSectionFallback(basePrompt)
}

export async function generateSectionImages(
  sections: SectionImageConfig[],
  slug: string,
  style: string = 'cinematic'
): Promise<Record<string, string>> {
  const results: Record<string, string> = {}

  console.log(`\n🎨 Generating ${sections.length} section images for "${slug}"...`)
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i]
    try {
      const url = await generateSectionImage(sec, slug, style)
      if (url) {
        results[sec.id] = url
        console.log(`  ✅ Section ${i + 1}/${sections.length}: "${sec.id}"`)
      }
    } catch (e) {
      console.log(`  ❌ Section ${i + 1}/${sections.length}: "${sec.id}" failed — ${(e as Error).message}`)
    }
    // Rate limit friendly delay
    if (i < sections.length - 1) {
      await new Promise((r) => setTimeout(r, 600))
    }
  }

  return results
}

export async function generateFeaturedImage(
  title: string,
  category: string,
  tags: string[],
  slug: string
): Promise<string> {
  if (process.env.SKIP_FAL_AI !== 'true') {
    // Primary: flux-pro/v1.1
    let falResult = await falGenerateHero(title, category, slug)

    if (!falResult) {
      console.warn('  [retry] flux-pro hero failed, trying flux/dev')
      falResult = await falGenerateImage(
        `Professional tech blog hero image for article about "${title}". Modern dark theme with purple and cyan gradient accents. Abstract visualization of ${category} technology. Clean minimalist digital art style, no text, no watermarks, high quality 4K illustration, futuristic tech aesthetic`,
        `${slug}-hero`,
        { width: 1200, height: 630, model: 'fal-ai/flux/dev' }
      )
    }

    if (falResult) return falResult
  }

  console.warn('[fallback] Using Pollinations for featured image')
  return pollinationsFallback(title, category, tags)
}

export async function generateOGImage(
  title: string,
  slug: string,
  author: string = 'יוסף אלישר'
): Promise<string> {
  if (process.env.SKIP_FAL_AI !== 'true') {
    let falResult = await falGenerateOG(title, slug, author)

    if (!falResult) {
      console.warn('  [retry] flux-pro OG failed, trying flux/dev')
      falResult = await falGenerateImage(
        `Social media card for tech article "${title}" by ${author}. Bold typography-ready background, tech blog aesthetic, dark theme with purple to cyan gradient, abstract geometric patterns, modern professional design, no text, clean composition, 4K quality`,
        `og-${slug}`,
        { width: 1200, height: 630, model: 'fal-ai/flux/dev' }
      )
    }

    if (falResult) return falResult
  }

  console.warn('[fallback] Using Pollinations for OG image')
  return pollinationsFallback(title, 'social', [])
}

/* ─── All-in-One Image Pack ─── */
export async function generateAllArticleImages(
  title: string,
  category: string,
  tags: string[],
  slug: string,
  sections: SectionImageConfig[]
): Promise<{
  featured: string
  og: string
  sections: Record<string, string>
}> {
  console.log('\n🎨 Generating complete image pack with fal.ai...')

  const featured = await generateFeaturedImage(title, category, tags, slug)
  console.log(`  Featured: ${featured}`)

  const og = await generateOGImage(title, slug)
  console.log(`  OG: ${og}`)

  const sectionImages = await generateSectionImages(sections, slug)
  console.log(`  Sections: ${Object.keys(sectionImages).length}/${sections.length} generated`)

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
