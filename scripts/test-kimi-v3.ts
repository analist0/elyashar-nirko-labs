#!/usr/bin/env ts-node
/**
 * Test Kimi API v3 - with correct endpoint
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function testKimi() {
  const apiKey = process.env.KIMI_API_KEY
  
  if (!apiKey) {
    console.error('❌ KIMI_API_KEY not found')
    return
  }

  console.log('🧪 Testing Kimi API...\n')
  console.log('API Key:', apiKey.substring(0, 20) + '...')

  // Test Chat API
  console.log('\n📡 Testing Chat API...')
  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kimi-k2-72b',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Write a short greeting in Hebrew' }
        ],
        max_tokens: 50,
      }),
    })

    console.log('Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Chat API working!')
      console.log('Response:', data.choices?.[0]?.message?.content)
    } else {
      const error = await response.text()
      console.error('❌ Chat API error:', error)
    }
  } catch (error) {
    console.error('❌ Exception:', error)
  }

  // Test Image Generation
  console.log('\n🎨 Testing Image Generation...')
  try {
    const response = await fetch('https://api.moonshot.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kimi-image-v1',
        prompt: 'A modern tech blog header image with purple and cyan gradient, clean minimalist design, abstract geometric shapes, code elements floating, professional quality digital art',
        size: '1200x630',
        quality: 'high',
        n: 1,
      }),
    })

    console.log('Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Image API working!')
      console.log('Image URL:', data.data?.[0]?.url)
    } else {
      const error = await response.text()
      console.error('❌ Image API error:', error)
    }
  } catch (error) {
    console.error('❌ Exception:', error)
  }
}

testKimi()
