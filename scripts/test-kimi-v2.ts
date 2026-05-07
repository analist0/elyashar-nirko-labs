#!/usr/bin/env ts-node
/**
 * Test Kimi API with different endpoints
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function testEndpoint(name: string, url: string, body: any) {
  const apiKey = process.env.KIMI_API_KEY
  
  console.log(`\n📡 Testing ${name}...`)
  console.log('URL:', url)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Success!')
      return data
    } else {
      const error = await response.text()
      console.log('❌ Error:', error.substring(0, 200))
      return null
    }
  } catch (error) {
    console.log('❌ Exception:', error)
    return null
  }
}

async function main() {
  const apiKey = process.env.KIMI_API_KEY
  
  if (!apiKey) {
    console.error('❌ KIMI_API_KEY not found')
    return
  }

  console.log('🧪 Testing Kimi API Endpoints\n')
  console.log('API Key:', apiKey.substring(0, 15) + '...')

  // Test 1: Moonshot Kimi API
  await testEndpoint(
    'Moonshot Chat API (kimi-latest)',
    'https://api.moonshot.cn/v1/chat/completions',
    {
      model: 'kimi-latest',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10,
    }
  )

  // Test 2: Moonshot with kimi-k2-72b
  await testEndpoint(
    'Moonshot Chat API (kimi-k2-72b)',
    'https://api.moonshot.cn/v1/chat/completions',
    {
      model: 'kimi-k2-72b',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10,
    }
  )

  // Test 3: Try OpenAI-compatible endpoint
  await testEndpoint(
    'OpenAI-compatible endpoint',
    'https://api.moonshot.cn/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10,
    }
  )

  console.log('\n✅ Tests completed!')
}

main()
