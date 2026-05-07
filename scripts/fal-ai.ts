#!/usr/bin/env tsx
/**
 * fal.ai Image Generator — FLUX.1 Dev / Schnell
 * Enterprise-grade image generation for blog posts
 */

import { fal } from '@fal-ai/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY || '',
})

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'generated')

function ensureDir() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
  }
}

interface GenerateOptions {
  width?: number
  height?: number
  model?: 'fal-ai/flux/dev' | 'fal-ai/flux/schnell' | 'fal-ai/flux-pro'
}

/**
 * Generate a single image using fal.ai FLUX
 */
export async function falGenerateImage(
  prompt: string,
  filename: string,
  options: GenerateOptions = {}
): Promise<string | null> {
  const { width = 1024, height = 576, model = 'fal-ai/flux/dev' } = options

  ensureDir()
  const filepath = path.join(IMAGES_DIR, `${filename}.png`)

  try {
    console.log(`  [fal.ai] Generating: ${filename} (${width}x${height})`)
    console.log(`  Prompt: ${prompt.slice(0, 80)}...`)

    // 30s timeout — fal.ai can be slow
    const timeoutMs = 30000
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('fal.ai timeout')), timeoutMs)
    })

    const falPromise = fal.subscribe(model, {
      input: {
        prompt,
        image_size: { width, height },
        num_images: 1,
        safety_tolerance: '2',
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs?.forEach((log) => console.log(`    ${log.message}`))
        }
      },
    })

    const result = await Promise.race([falPromise, timeoutPromise])

    const imageUrl = result.data?.images?.[0]?.url
    if (!imageUrl) {
      console.warn(`  [fal.ai] No image URL returned for ${filename}`)
      return null
    }

    // Download the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(filepath, buffer)

    const publicPath = `/images/generated/${filename}.png`
    console.log(`  [fal.ai] Saved: ${publicPath}`)
    return publicPath

  } catch (err: any) {
    if (err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('abort')) {
      console.warn(`  [fal.ai] Timeout after 30s for ${filename} — using fallback`)
    } else {
      console.error(`  [fal.ai] Error generating ${filename}:`, err.message || err)
    }
    return null
  }
}

/**
 * Generate hero/featured image for a blog post
 */
export async function generateHeroImage(
  title: string,
  category: string,
  slug: string
): Promise<string | null> {
  const prompt = `Professional tech blog hero image for article about "${title}".
Modern dark theme with purple and cyan gradient accents.
Abstract visualization of ${category} technology.
Clean minimalist digital art style, no text, no watermarks,
high quality 4K illustration, futuristic tech aesthetic`

  return falGenerateImage(prompt, `${slug}-hero`, {
    width: 1200,
    height: 630,
  })
}

/**
 * Generate section image for blog content
 */
export async function generateSectionImage(
  sectionTitle: string,
  sectionId: string,
  slug: string,
  topic: string
): Promise<string | null> {
  const prompt = `Tech illustration for "${sectionTitle}" section about ${topic}.
${sectionId === 'installation' ? 'Terminal and code editor visual' : ''}
${sectionId === 'usage' ? 'Code snippets and workflow diagram' : ''}
${sectionId === 'components' ? 'UI components and interface elements' : ''}
${sectionId === 'advanced' ? 'Complex system architecture visualization' : ''}
Dark background with purple and cyan glowing accents,
modern tech aesthetic, no text, high quality digital art`

  return falGenerateImage(prompt, `${slug}-section-${sectionId}`, {
    width: 1024,
    height: 576,
  })
}

/**
 * Generate OG/social card image
 */
export async function generateOGImage(
  title: string,
  slug: string,
  author: string = 'יוסף אלישר'
): Promise<string | null> {
  const prompt = `Social media card for tech article "${title}" by ${author}.
Bold typography-ready background, tech blog aesthetic,
dark theme with purple to cyan gradient,
abstract geometric patterns, modern professional design,
no text, clean composition, 4K quality`

  return falGenerateImage(prompt, `og-${slug}`, {
    width: 1200,
    height: 630,
  })
}

/**
 * Generate complete image pack for a blog post
 */
export async function generateBlogImagePack(
  title: string,
  category: string,
  slug: string,
  sections: Array<{ id: string; title: string }>
): Promise<{
  hero: string | null
  og: string | null
  sections: Record<string, string>
}> {
  console.log(`\n🎨 [fal.ai] Generating image pack for "${title}"...`)

  // Generate hero
  const hero = await generateHeroImage(title, category, slug)

  // Generate OG
  const og = await generateOGImage(title, slug)

  // Generate section images (sequentially to avoid rate limits)
  const sectionImages: Record<string, string> = {}
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i]
    console.log(`\n  Section ${i + 1}/${sections.length}: ${sec.title}`)
    const url = await generateSectionImage(sec.title, sec.id, slug, title)
    if (url) {
      sectionImages[sec.id] = url
      // Small delay between requests
      if (i < sections.length - 1) {
        await new Promise((r) => setTimeout(r, 500))
      }
    }
  }

  console.log(`\n✅ Image pack complete: hero=${!!hero}, og=${!!og}, sections=${Object.keys(sectionImages).length}`)

  return { hero, og, sections: sectionImages }
}

/* ─── Test / CLI ─── */
async function main() {
  const testPrompt = process.argv[2] || 'Modern tech blog header for AI development, dark theme purple cyan gradient'
  const filename = process.argv[3] || 'test-fal'

  console.log('🧪 fal.ai Image Generator Test\n')
  console.log('Prompt:', testPrompt)

  const result = await falGenerateImage(testPrompt, filename)

  if (result) {
    console.log('\n✅ Success!')
    console.log('Image saved to:', result)
  } else {
    console.log('\n❌ Failed to generate image')
    process.exit(1)
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  main().catch(console.error)
}
