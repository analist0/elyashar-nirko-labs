#!/usr/bin/env ts-node
/**
 * Test Kimi API connectivity
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function testKimiAPI() {
  const apiKey = process.env.KIMI_API_KEY
  
  if (!apiKey) {
    console.error('❌ KIMI_API_KEY not found')
    process.exit(1)
  }

  console.log('🧪 Testing Kimi API...\n')
  console.log('API Key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4))

  try {
    // Test chat API first
    console.log('\n📡 Testing Chat API...')
    const chatResponse = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kimi-latest',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Kimi API is working!" in Hebrew' }
        ],
        max_tokens: 50,
      }),
    })

    if (chatResponse.ok) {
      const data = await chatResponse.json()
      console.log('✅ Chat API working!')
      console.log('   Response:', data.choices?.[0]?.message?.content)
    } else {
      console.error('❌ Chat API error:', chatResponse.status)
      const error = await chatResponse.text()
      console.error('   Error:', error)
    }

    // Test image generation
    console.log('\n🎨 Testing Image Generation API...')
    const imageResponse = await fetch('https://api.moonshot.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kimi-image-v1',
        prompt: 'A beautiful modern tech blog header image with purple and cyan gradient, clean minimalist design, abstract geometric shapes, professional quality',
        size: '1200x630',
        quality: 'high',
        n: 1,
      }),
    })

    if (imageResponse.ok) {
      const data = await imageResponse.json()
      console.log('✅ Image API working!')
      console.log('   Image URL:', data.data?.[0]?.url?.substring(0, 60) + '...')
    } else {
      console.error('❌ Image API error:', imageResponse.status)
      const error = await imageResponse.text()
      console.error('   Error:', error)
      console.log('\n💡 Note: Image generation might require special permissions')
    }

    console.log('\n✅ Tests completed!')

  } catch (error) {
    console.error('❌ Error testing API:', error)
  }
}

testKimiAPI()
