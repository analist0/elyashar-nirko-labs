#!/usr/bin/env node
/**
 * Joseph Elyashar Portfolio — Sales Agent API
 * Uses Ollama Pro Cloud API (kimi-k2.5 / gpt-oss:120b) — $20/mo, 3 models parallel
 * Sends Telegram notification + hands off conversation on high intent
 * Added: session store, Telegram webhook, CMS admin API, comments, rate limiting, security headers
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')
const crypto = require('crypto')

const PORT = 3004
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || ''
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gpt-oss:120b'
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123'
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''

const OLLAMA_URL = 'https://ollama.com/api/chat'

let SYSTEM_PROMPT = `אתה עוזר מכירות ושיווק של יוסף אלישר — מפתח Full-Stack ו-AI ישראלי מנוסה.

שירותי יוסף ומחירים:
• אפליקציות AI וצ'אט-בוטים חכמים: ₪3,000–₪15,000
• אתרי Portfolio ו-Landing Pages מרשימים: ₪1,500–₪5,000
• פיתוח Full-Stack מלא (Next.js, React, TypeScript): ₪5,000–₪25,000
• אוטומציה, SEO ו-API integrations: ₪2,000–₪8,000
• ייעוץ טכנולוגי אישי: ₪350/שעה
• מערכות AI מתקדמות (LLM, RAG, Agents): ₪8,000–₪30,000

טכנולוגיות: Next.js 14, React 18, TypeScript, Python, Node.js, Cloudflare Workers, Docker, Kubernetes, AI/LLM integrations, Telegram bots, n8n automation.

כללי התנהגות:
- דבר בעברית חברותית, חמה ומקצועית
- שאל שאלות ממוקדות כדי להבין את הצורך לפני הצגת מחירים
- תן ערך אמיתי — טיפ, הסבר, רעיון — בכל תשובה
- הסבר מה כולל כל שירות ולמה שווה את המחיר
- כשלקוח מביע עניין רציני — בקש שם ואמצעי קשר (טלפון/אימייל/טלגרם)
- אחרי שקיבלת פרטי קשר — כתוב HANDOFF בסוף (הקוד ינקה את המילה)
- אל תכתוב HANDOFF לפני שיש פרטי קשר ממשיים
- תשובות קצרות וממוקדות — עד 3 פסקאות`

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://ollama.com https://api.telegram.org; frame-ancestors 'none';",
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

/* ─── Session Store ─── */
const sessions = new Map()

function getSession(id) {
  if (!sessions.has(id)) {
    sessions.set(id, { messages: [], handoff: false, adminTyping: false, lastActivity: Date.now() })
  }
  const s = sessions.get(id)
  s.lastActivity = Date.now()
  return s
}

function addMessage(id, msg) {
  const s = getSession(id)
  s.messages.push(msg)
  s.lastActivity = Date.now()
}

function cleanupOldSessions() {
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000
  for (const [id, s] of sessions.entries()) {
    if (now - s.lastActivity > DAY) {
      sessions.delete(id)
    }
  }
}

/* ─── Rate Limiting ─── */
const rateLimitComments = new Map() // ip+slug -> timestamp
const rateLimitChat = new Map() // ip -> [timestamp, ...]

const COMMENT_COOLDOWN_MS = 30 * 1000 // 30 seconds
const CHAT_MAX_PER_MINUTE = 10
const CHAT_WINDOW_MS = 60 * 1000 // 1 minute

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

function isRateLimitedComment(ip, slug) {
  const key = `${ip}:${slug}`
  const last = rateLimitComments.get(key)
  if (last && Date.now() - last < COMMENT_COOLDOWN_MS) {
    return true
  }
  rateLimitComments.set(key, Date.now())
  return false
}

function isRateLimitedChat(ip) {
  const now = Date.now()
  let timestamps = rateLimitChat.get(ip) || []
  timestamps = timestamps.filter(t => now - t < CHAT_WINDOW_MS)
  if (timestamps.length >= CHAT_MAX_PER_MINUTE) {
    return true
  }
  timestamps.push(now)
  rateLimitChat.set(ip, timestamps)
  return false
}

function cleanupRateLimits() {
  const now = Date.now()
  for (const [key, ts] of rateLimitComments.entries()) {
    if (now - ts > COMMENT_COOLDOWN_MS) {
      rateLimitComments.delete(key)
    }
  }
  for (const [ip, timestamps] of rateLimitChat.entries()) {
    const filtered = timestamps.filter(t => now - t < CHAT_WINDOW_MS)
    if (filtered.length === 0) {
      rateLimitChat.delete(ip)
    } else {
      rateLimitChat.set(ip, filtered)
    }
  }
}

/* ─── Input Sanitization ─── */
const DANGEROUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<script[^>]*\/>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
]

function sanitizeText(input) {
  if (typeof input !== 'string') return ''
  let cleaned = input
  for (const pattern of DANGEROUS_PATTERNS) {
    cleaned = cleaned.replace(pattern, '')
  }
  return cleaned.trim()
}

function escapeHtml(input) {
  if (typeof input !== 'string') return ''
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function clampLength(input, maxLen) {
  if (typeof input !== 'string') return ''
  return input.slice(0, maxLen).trim()
}

/* ─── Comments Store ─── */
const COMMENTS_DIR = path.join(__dirname, '..', 'content', 'comments')

function ensureCommentsDir() {
  if (!fs.existsSync(COMMENTS_DIR)) {
    fs.mkdirSync(COMMENTS_DIR, { recursive: true })
  }
}

function getCommentsFilePath(slug) {
  ensureCommentsDir()
  return path.join(COMMENTS_DIR, `${slug}.json`)
}

function readComments(slug) {
  const filePath = getCommentsFilePath(slug)
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    if (Array.isArray(data.comments)) {
      return data.comments
    }
  } catch {
    // File doesn't exist or is invalid
  }
  return []
}

function writeComments(slug, comments) {
  const filePath = getCommentsFilePath(slug)
  fs.writeFileSync(filePath, JSON.stringify({ comments }, null, 2))
}

/* ─── Ollama ─── */
async function callOllama(messages) {
  const body = JSON.stringify({
    model: OLLAMA_MODEL,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-12)],
    stream: false,
    options: { temperature: 0.7 },
  })

  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OLLAMA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Ollama error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.message?.content || ''
}

/* ─── Telegram ─── */
async function sendTelegram(text) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('⚠️  Telegram not configured')
    return
  }
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  }).catch(err => console.error('Telegram error:', err))
}

function formatTelegram(messages, agentReply, sessionId) {
  const history = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'user' ? '👤 <b>לקוח:</b>' : '🤖 <b>בוט:</b>'}\n${m.content}`)
    .join('\n\n')
  return `🔔 <b>ליד חדש מהאתר!</b> 🚀\n\nSession: ${sessionId}\n\n${history}\n\n🤖 <b>בוט:</b>\n${agentReply}\n\n📱 <i>הגב ישירות ללקוח בטלגרם</i>`
}

/* ─── Helpers ─── */
function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function generateCommentId() {
  return `cmt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function parseBody(req, callback) {
  let body = ''
  req.on('data', c => (body += c))
  req.on('end', () => {
    try {
      callback(null, JSON.parse(body))
    } catch (e) {
      callback(e, null)
    }
  })
}

function serveJson(res, status, data) {
  res.writeHead(status, { ...CORS, ...SECURITY_HEADERS })
  res.end(JSON.stringify(data))
}

/* ─── Basic Auth ─── */
function basicAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Basic ')) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Admin"', ...CORS, ...SECURITY_HEADERS })
    return res.end(JSON.stringify({ error: 'Unauthorized' }))
  }
  const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':')
  if (credentials[0] !== ADMIN_USER || credentials[1] !== ADMIN_PASS) {
    res.writeHead(403, { ...CORS, ...SECURITY_HEADERS })
    return res.end(JSON.stringify({ error: 'Forbidden' }))
  }
  next()
}

/* ─── CMS Handlers ─── */
function handleAdmin(req, res, pathname) {
  const contentDir = path.join(__dirname, '..', 'content')
  const postsDir = path.join(contentDir, 'posts')

  // GET /admin/posts
  if (pathname === '/admin/posts' && req.method === 'GET') {
    try {
      if (!fs.existsSync(postsDir)) {
        return serveJson(res, 200, [])
      }
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json') && f !== 'topics.json')
      const posts = files.map(f => readJsonFile(path.join(postsDir, f))).filter(Boolean)
      posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      return serveJson(res, 200, posts)
    } catch (e) {
      return serveJson(res, 500, { error: e.message })
    }
  }

  // POST /admin/posts
  if (pathname === '/admin/posts' && req.method === 'POST') {
    return parseBody(req, (err, body) => {
      if (err) return serveJson(res, 400, { error: 'Invalid JSON' })
      const slug = body.slug || body.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || `post-${Date.now()}`
      const filePath = path.join(postsDir, `${slug}.json`)
      if (fs.existsSync(filePath)) {
        return serveJson(res, 409, { error: 'Post already exists' })
      }
      try {
        fs.mkdirSync(postsDir, { recursive: true })
        fs.writeFileSync(filePath, JSON.stringify({ ...body, slug }, null, 2))
        return serveJson(res, 201, { ...body, slug })
      } catch (e) {
        return serveJson(res, 500, { error: e.message })
      }
    })
  }

  // PUT /admin/posts/:slug
  if (pathname.startsWith('/admin/posts/') && req.method === 'PUT') {
    const parts = pathname.split('/')
    const slug = parts[3]
    const filePath = path.join(postsDir, `${slug}.json`)
    return parseBody(req, (err, body) => {
      if (err) return serveJson(res, 400, { error: 'Invalid JSON' })
      if (!fs.existsSync(filePath)) {
        return serveJson(res, 404, { error: 'Post not found' })
      }
      try {
        fs.writeFileSync(filePath, JSON.stringify({ ...body, slug }, null, 2))
        return serveJson(res, 200, { ...body, slug })
      } catch (e) {
        return serveJson(res, 500, { error: e.message })
      }
    })
  }

  // DELETE /admin/posts/:slug
  if (pathname.startsWith('/admin/posts/') && req.method === 'DELETE') {
    const parts = pathname.split('/')
    const slug = parts[3]
    const filePath = path.join(postsDir, `${slug}.json`)
    if (!fs.existsSync(filePath)) {
      return serveJson(res, 404, { error: 'Post not found' })
    }
    try {
      fs.unlinkSync(filePath)
      res.writeHead(204, { ...CORS, ...SECURITY_HEADERS })
      return res.end()
    } catch (e) {
      return serveJson(res, 500, { error: e.message })
    }
  }

  // GET /admin/topics
  if (pathname === '/admin/topics' && req.method === 'GET') {
    const topics = readJsonFile(path.join(contentDir, 'topics.json')) || []
    return serveJson(res, 200, topics)
  }

  // DELETE /admin/topics/:slug
  if (pathname.startsWith('/admin/topics/') && req.method === 'DELETE') {
    const parts = pathname.split('/')
    const slug = parts[3]
    const topicsPath = path.join(contentDir, 'topics.json')
    let topics = readJsonFile(topicsPath) || []
    topics = topics.filter(t => t.slug !== slug)
    try {
      fs.writeFileSync(topicsPath, JSON.stringify(topics, null, 2))
      return serveJson(res, 200, topics)
    } catch (e) {
      return serveJson(res, 500, { error: e.message })
    }
  }

  // GET /admin/settings
  if (pathname === '/admin/settings' && req.method === 'GET') {
    return serveJson(res, 200, { systemPrompt: SYSTEM_PROMPT, services: [] })
  }

  // POST /admin/settings
  if (pathname === '/admin/settings' && req.method === 'POST') {
    return parseBody(req, (err, body) => {
      if (err) return serveJson(res, 400, { error: 'Invalid JSON' })
      if (body.systemPrompt !== undefined) {
        SYSTEM_PROMPT = body.systemPrompt
      }
      return serveJson(res, 200, { systemPrompt: SYSTEM_PROMPT })
    })
  }

  serveJson(res, 404, { error: 'Not found' })
}

/* ─── Server ─── */
const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { ...CORS, ...SECURITY_HEADERS })
    return res.end()
  }

  const url = new URL(req.url, 'http://localhost')
  const pathname = url.pathname

  // Root
  if (pathname === '/' && req.method === 'GET') {
    return serveJson(res, 200, {
      service: 'ElyasharLabs Sales Agent API',
      status: 'ok',
      endpoints: ['/chat', '/messages/:sessionId', '/webhook', '/health', '/admin/*', '/comments/:slug'],
      model: OLLAMA_MODEL,
      sessions: sessions.size,
    })
  }

  // Health check
  if (pathname === '/health' && req.method === 'GET') {
    return serveJson(res, 200, { status: 'ok', sessions: sessions.size, model: OLLAMA_MODEL })
  }

  // GET /chat (helpful for browser checks — returns instructions)
  if (pathname === '/chat' && req.method === 'GET') {
    return serveJson(res, 200, {
      status: 'ok',
      message: 'Sales Agent API — use POST with JSON body { messages: [{role,content}], sessionId }',
      endpoints: ['/chat', '/messages/:sessionId', '/webhook', '/health', '/admin/*', '/comments/:slug'],
      model: OLLAMA_MODEL,
      sessions: sessions.size,
    })
  }

  // Chat
  if (pathname === '/chat' && req.method === 'POST') {
    return parseBody(req, async (err, body) => {
      if (err) {
        return serveJson(res, 400, { error: 'Invalid JSON' })
      }
      try {
        const clientIp = getClientIp(req)
        if (isRateLimitedChat(clientIp)) {
          return serveJson(res, 429, { error: 'Too many requests. Please wait a moment.' })
        }

        const { messages, sessionId: providedSessionId } = body
        const sessionId = providedSessionId || generateSessionId()
        const session = getSession(sessionId)

        if (messages && Array.isArray(messages)) {
          for (const m of messages) {
            if (m.role && m.content) {
              const last = session.messages[session.messages.length - 1]
              if (!last || last.role !== m.role || last.content !== m.content) {
                session.messages.push({ role: m.role, content: m.content, timestamp: Date.now() })
              }
            }
          }
        }

        const rawReply = await callOllama(messages || [])
        const handoff = rawReply.includes('HANDOFF')
        const reply = rawReply.replace(/HANDOFF/g, '').trim()

        addMessage(sessionId, { role: 'assistant', content: reply, timestamp: Date.now(), from: 'bot' })

        if (handoff) {
          session.handoff = true
          await sendTelegram(formatTelegram(messages || [], reply, sessionId))
          console.log('📱 Telegram notification sent — new lead! Session:', sessionId)
        }

        return serveJson(res, 200, { response: reply, handoff, sessionId })
      } catch (err) {
        console.error('Error:', err.message)
        return serveJson(res, 500, { response: 'מצטערים, יש בעיה טכנית. נסה שוב.', handoff: false, sessionId: body?.sessionId || null })
      }
    })
  }

  // Messages
  if (pathname.startsWith('/messages/') && req.method === 'GET') {
    const parts = pathname.split('/')
    const sessionId = parts[2]
    const since = url.searchParams.get('since')
    const session = sessions.get(sessionId)

    let messages = []
    if (session && session.messages) {
      if (since) {
        const sinceMs = parseInt(since, 10)
        messages = session.messages.filter(m => m.timestamp > sinceMs)
      } else {
        messages = session.messages.slice(-10)
      }
    }

    return serveJson(res, 200, { messages })
  }

  // Comments — GET /comments/:slug
  if (pathname.startsWith('/comments/') && req.method === 'GET') {
    const parts = pathname.split('/')
    const slug = parts[2]
    const comments = readComments(slug)
      .filter(c => c.approved !== false)
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
    return serveJson(res, 200, { comments })
  }

  // Comments — POST /comments/:slug
  if (pathname.startsWith('/comments/') && req.method === 'POST') {
    return parseBody(req, (err, body) => {
      if (err) {
        return serveJson(res, 400, { error: 'Invalid JSON' })
      }

      const parts = pathname.split('/')
      const slug = parts[2]
      const clientIp = getClientIp(req)

      if (isRateLimitedComment(clientIp, slug)) {
        return serveJson(res, 429, { error: 'Too many requests. Please wait 30 seconds before posting another comment.' })
      }

      let { name = 'Anonymous', email = '', content = '' } = body || {}

      // Sanitize and validate
      name = clampLength(sanitizeText(name), 100) || 'Anonymous'
      email = clampLength(sanitizeText(email), 254)
      content = clampLength(sanitizeText(content), 2000)

      if (!content) {
        return serveJson(res, 400, { error: 'Comment content is required' })
      }

      // Escape HTML entities in content before storing
      const safeContent = escapeHtml(content)

      const comment = {
        id: generateCommentId(),
        name,
        email,
        content: safeContent,
        timestamp: new Date().toISOString(),
        approved: true,
      }

      const comments = readComments(slug)
      comments.push(comment)
      writeComments(slug, comments)

      return serveJson(res, 201, { comment })
    })
  }

  // Telegram webhook
  if (pathname === '/webhook' && req.method === 'POST') {
    return parseBody(req, (err, body) => {
      if (err) {
        return serveJson(res, 400, { error: 'Invalid JSON' })
      }

      if (WEBHOOK_SECRET) {
        const secret = req.headers['x-telegram-bot-api-secret-token']
        if (secret !== WEBHOOK_SECRET) {
          return serveJson(res, 401, { error: 'Unauthorized' })
        }
      }

      const text = body.message?.text || ''
      const replyTo = body.message?.reply_to_message?.text || ''
      const searchText = `${text}\n${replyTo}`
      const match = searchText.match(/Session:\s*(\S+)/)

      if (match) {
        const sessionId = match[1]
        const replyText = text.replace(/Session:\s*\S+/g, '').trim()
        if (replyText && sessions.has(sessionId)) {
          addMessage(sessionId, { role: 'assistant', content: replyText, timestamp: Date.now(), from: 'admin' })
          const s = getSession(sessionId)
          s.adminTyping = false
        }
      }

      return serveJson(res, 200, { ok: true })
    })
  }

  // Admin routes
  if (pathname.startsWith('/admin/')) {
    return basicAuth(req, res, () => handleAdmin(req, res, pathname))
  }

  serveJson(res, 404, { error: 'Not found' })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Sales Agent API (Ollama Pro) → http://localhost:${PORT}`)
  console.log(`   Model: ${OLLAMA_MODEL}`)
  console.log(`   Telegram: ${TELEGRAM_TOKEN ? '✅' : '❌ not set'}`)
  console.log(`   Admin user: ${ADMIN_USER}`)
})

// Clean up stale sessions once per hour
setInterval(cleanupOldSessions, 60 * 60 * 1000)

// Clean up rate limit entries every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000)
