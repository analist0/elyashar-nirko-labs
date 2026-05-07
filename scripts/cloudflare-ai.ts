#!/usr/bin/env ts-node
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CF_BASE = `https://api.cloudflare.com/client/v4/accounts`

function cfHeaders(): Record<string, string> {
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!token) throw new Error('CLOUDFLARE_API_TOKEN not set')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

function accountId(): string {
  const id = process.env.CLOUDFLARE_ACCOUNT_ID
  if (!id) throw new Error('CLOUDFLARE_ACCOUNT_ID not set')
  return id
}

export async function cfTextGenerate(
  messages: Array<{ role: string; content: string }>,
  maxTokens = 4096
): Promise<string> {
  const url = `${CF_BASE}/${accountId()}/ai/run/@cf/meta/llama-3.1-70b-instruct`
  const res = await fetch(url, {
    method: 'POST',
    headers: cfHeaders(),
    body: JSON.stringify({ messages, max_tokens: maxTokens }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`CF text gen error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.result?.response || ''
}

export async function cfImageGenerate(
  prompt: string,
  negativePrompt = 'blurry, low quality, distorted, text, words, watermark, nsfw',
  width = 1024,
  height = 576
): Promise<Buffer | null> {
  const url = `${CF_BASE}/${accountId()}/ai/run/@cf/black-forest-labs/flux-1-schnell`
  const res = await fetch(url, {
    method: 'POST',
    headers: cfHeaders(),
    body: JSON.stringify({ prompt, negative_prompt: negativePrompt, width, height }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`CF image gen error ${res.status}: ${err}`)
    return null
  }
  return Buffer.from(await res.arrayBuffer())
}

export async function cfGenerateAndSaveImage(
  prompt: string,
  filename: string,
  negativePrompt?: string
): Promise<string | null> {
  const imagesDir = path.join(__dirname, '..', 'public', 'images', 'generated')
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })

  const buffer = await cfImageGenerate(prompt, negativePrompt)
  if (!buffer) return null

  const filepath = path.join(imagesDir, `${filename}.png`)
  fs.writeFileSync(filepath, buffer)
  console.log(`🖼️  Image saved: ${filepath}`)
  return `/images/generated/${filename}.png`
}
