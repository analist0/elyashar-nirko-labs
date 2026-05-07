#!/usr/bin/env ts-node
/**
 * Ollama Pro AI Helper — Content Generation
 * Uses Ollama Cloud API ($20/mo Pro) with kimi-k2.5 / gpt-oss:120b
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const OLLAMA_BASE = 'https://ollama.com/api'

function getApiKey(): string {
  const key = process.env.OLLAMA_API_KEY
  if (!key) throw new Error('OLLAMA_API_KEY not set in .env.local')
  return key
}

function getModel(): string {
  return process.env.OLLAMA_MODEL || 'gpt-oss:120b'
}

function ollamaHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  }
}

/** Generate text via Ollama /api/generate (single prompt) */
export async function ollamaGenerate(
  prompt: string,
  options: { temperature?: number; numPredict?: number } = {}
): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE}/generate`, {
    method: 'POST',
    headers: ollamaHeaders(),
    body: JSON.stringify({
      model: getModel(),
      prompt,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.numPredict ?? 4096,
      },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Ollama generate error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.response || ''
}

/** Generate text via Ollama /api/chat (conversational, preferred) */
export async function ollamaChatGenerate(
  messages: Array<{ role: string; content: string }>,
  options: { temperature?: number; numPredict?: number } = {}
): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE}/chat`, {
    method: 'POST',
    headers: ollamaHeaders(),
    body: JSON.stringify({
      model: getModel(),
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.numPredict ?? 4096,
      },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Ollama chat error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.message?.content || ''
}
