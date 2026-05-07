/**
 * Cloudflare Worker — Joseph Elyashar Portfolio Sales Agent
 *
 * Deploy:
 *   cd workers && npm install && npx wrangler deploy
 *
 * Set secrets:
 *   npx wrangler secret put TELEGRAM_BOT_TOKEN
 *   npx wrangler secret put TELEGRAM_CHAT_ID
 */

interface Env {
  AI: Ai
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_CHAT_ID: string
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const SYSTEM_PROMPT = `אתה עוזר מכירות ושיווק של יוסף אלישר — מפתח Full-Stack ו-AI ישראלי מנוסה עם ניסיון בחברות סטארטאפ ובינלאומיות.

שירותים ומחירים:
• אפליקציות AI וצ'אט-בוטים: ₪3,000–₪15,000
• אתרי Portfolio ו-Landing Pages: ₪1,500–₪5,000
• פיתוח Full-Stack (Next.js, React, TypeScript): ₪5,000–₪25,000
• אוטומציה, SEO ו-API integrations: ₪2,000–₪8,000
• ייעוץ טכנולוגי: ₪350/שעה

טכנולוגיות: Next.js, React, TypeScript, Python, Node.js, Cloudflare Workers, AI/LLM integrations.

כללי התנהגות:
- דבר בעברית חברותית ומקצועית
- שאל שאלות כדי להבין את הצורך לפני שאתה מציג מחירים
- תן ערך אמיתי בכל תשובה (טיפ, הסבר, רעיון)
- כשלקוח מביע עניין רציני (מחפש הצעת מחיר, שואל מתי אפשר להתחיל, רוצה לדבר עם יוסף) — בקש שם ומספר טלפון/אימייל
- לאחר קבלת פרטי קשר, הוסף בדיוק "HANDOFF" בסוף התשובה
- אל תציין HANDOFF אלא אם יש פרטי קשר בשיחה`

async function sendTelegram(token: string, chatId: string, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

function formatConversationForTelegram(messages: ChatMessage[]): string {
  const lines = messages
    .filter(m => m.role !== 'system')
    .map(m => {
      const speaker = m.role === 'user' ? '👤 <b>לקוח:</b>' : '🤖 <b>בוט:</b>'
      return `${speaker}\n${m.content.replace('HANDOFF', '').trim()}`
    })
    .join('\n\n')

  return `🔔 <b>ליד חדש מהאתר!</b>\n\n${lines}`
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS })
    }

    let messages: ChatMessage[]
    try {
      const body = await request.json() as { messages: ChatMessage[] }
      messages = body.messages ?? []
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS })
    }

    const aiMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-12), // Keep last 12 turns for context
    ]

    let agentReply = ''
    try {
      const result = await env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: aiMessages,
        max_tokens: 600,
      }) as { response: string }
      agentReply = result.response || ''
    } catch (err) {
      console.error('AI error:', err)
      return Response.json(
        { response: 'מצטערים, יש בעיה טכנית. ניסה שוב בעוד רגע.', handoff: false },
        { headers: CORS_HEADERS }
      )
    }

    const shouldHandoff = agentReply.includes('HANDOFF')
    const cleanReply = agentReply.replace('HANDOFF', '').trim()

    if (shouldHandoff && env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      const fullConversation: ChatMessage[] = [...messages, { role: 'assistant', content: cleanReply }]
      const telegramText = formatConversationForTelegram(fullConversation)
      await sendTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, telegramText)
    }

    return Response.json(
      { response: cleanReply, handoff: shouldHandoff },
      { headers: CORS_HEADERS }
    )
  },
}
