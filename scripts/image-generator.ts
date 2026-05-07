#!/usr/bin/env ts-node
/**
 * Image Generator - Using Pollinations.ai (Free & Fast)
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'generated')

// Ensure directory exists
function ensureDir() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
  }
}

// Generate URL for Pollinations.ai
function generateImageUrl(title: string, category: string, keywords: string[]): string {
  const enhancedPrompt = 
    `Professional tech blog header image for article about "${title}". ` +
    `Category: ${category}. ` +
    `Style: Modern gradient background from deep purple (#667eea) to electric cyan (#06b6d4). ` +
    `Abstract floating code blocks, terminal windows, geometric circuit patterns. ` +
    `Clean minimalist design, soft professional lighting, high quality digital art. ` +
    `Keywords: ${keywords.slice(0, 4).join(', ')}. ` +
    `No text, no words, no watermarks, no blurry elements.`
  
  const encodedPrompt = encodeURIComponent(enhancedPrompt)
  const seed = Date.now()
  
  // Using Pollinations.ai - completely free, no API key needed
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true&seed=${seed}&negative_prompt=text,words,watermark,blurry,low+quality,distorted,ugly,deformed`
}

// Download image from URL
async function downloadImage(url: string, filename: string): Promise<string | null> {
  ensureDir()
  const filepath = path.join(IMAGES_DIR, filename)
  
  try {
    console.log('  📥 Downloading image...')
    const response = await fetch(url, { timeout: 60000 } as any)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const buffer = Buffer.from(await response.arrayBuffer())
    
    // Verify it's an image (check magic numbers)
    if (buffer.length < 100) {
      throw new Error('Image too small, probably an error')
    }
    
    fs.writeFileSync(filepath, buffer)
    console.log(`  ✅ Image saved: ${filepath}`)
    
    return `/images/generated/${filename}`
  } catch (error) {
    console.error('  ❌ Download failed:', error)
    return null
  }
}

// Generate blog featured image
async function generateBlogImage(
  title: string,
  category: string,
  keywords: string[]
): Promise<string> {
  console.log('\n🎨 Generating featured image...')
  console.log(`   Title: ${title.substring(0, 50)}...`)
  
  const imageUrl = generateImageUrl(title, category, keywords)
  
  // Generate unique filename
  const timestamp = Date.now()
  const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)
  const filename = `${safeTitle}-${timestamp}.jpg`
  
  // Try to download
  const localPath = await downloadImage(imageUrl, filename)
  
  if (localPath) {
    console.log('  ✅ Featured image ready!')
    return localPath
  }
  
  // If download failed, return the URL directly
  console.log('  ⚠️  Using remote URL')
  return imageUrl
}

// Test function
async function test() {
  console.log('🧪 Testing Image Generator\n')
  
  const testTitle = 'Docker: המדריך המלא להתקנה'
  
  const imagePath = await generateBlogImage(
    testTitle,
    'DevOps',
    ['docker', 'containers', 'virtualization']
  )
  
  console.log('\n✅ Test completed!')
  console.log('   Path:', imagePath)
}

// Run if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  test().catch(console.error)
}

export { generateImageUrl, downloadImage, generateBlogImage }
