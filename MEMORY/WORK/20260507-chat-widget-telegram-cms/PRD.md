---
task: Fix chat widget, Telegram live handoff, CMS CRUD
slug: 20260507-chat-widget-telegram-cms
effort: advanced
phase: complete
progress: 30/30
mode: interactive
started: 2026-05-07T11:47:00Z
updated: 2026-05-07T12:07:00Z
---

## Context

The user's portfolio website (elyasharLabs.com) has three urgent customer-facing issues:

1. **Chat widget is broken**: Messages do not auto-scroll, the user reports "גול וגול במקום לגלול אוטומטי" (it jumps around instead of smooth auto-scroll). The design is basic and unprofessional. No typing animation exists.
2. **No live handoff**: The sales agent sends a Telegram notification when a lead is hot, but the admin cannot reply via Telegram and have the reply appear on the customer's chat widget. The user wants true two-way live conversation handoff.
3. **No CMS**: The user explicitly demanded "CMS FULL CRUD ON ALL THE SYSTEM ALLLLLLL" — needs a management interface for blog posts, topics, images, and agent settings.

Constraints:
- Next.js 14 App Router with static export (output: 'export', distDir: 'dist')
- No server-side runtime in Next.js; API is a separate Node.js server (api/server.js)
- Hebrew RTL throughout
- All data stored as JSON files on disk (content/posts/, content/topics.json)
- Static export means no API routes in src/app/ — CMS must either be a separate server route or use a different pattern

Previous work:
- `components/SalesAgent.tsx` exists with basic chat
- `api/server.js` exists with Ollama Pro integration and one-way Telegram notification
- Blog system reads JSON posts from content/posts/
- Content generation script writes to content/posts/ and public/images/generated/

### Plan

**Chat Widget (components/SalesAgent.tsx)**
- Full component rewrite preserving existing API integration
- Use `useTheme()` from `src/context/ThemeContext.tsx` for dark/light adaptation
- Smooth auto-scroll via `requestAnimationFrame` + `scrollTo({ behavior: 'smooth' })`
- CSS keyframe typing dots animation
- Glassmorphism design with `backdrop-blur`, `bg-white/5`, `border-white/10`
- Session ID generation and storage in `localStorage`
- Proactive greeting timer (30s on first visit)
- Unread message pulse on floating button
- Mobile responsive: `w-[calc(100vw-2rem)]` on screens < 480px
- Status indicator: online (green dot), typing (animated dots), offline (gray)
- Multiline textarea input with Shift+Enter support

**API Server (api/server.js)**
- In-memory session store: `Map<sessionId, { messages, handoff, lastActivity }>`
- POST `/chat`: stores messages, returns sessionId, detects handoff
- GET `/messages/:sessionId?since=timestamp`: long-polling for new messages
- POST `/webhook`: Telegram bot webhook. Validates token, routes admin replies to sessions
- Admin routes with HTTP Basic Auth (`/admin/*`)
- CMS endpoints: GET/POST/PUT/DELETE for posts, GET/DELETE for topics, GET/POST for settings
- File system operations for CRUD on `content/posts/` and `content/topics.json`

**CMS Page (src/app/admin/page.tsx)**
- Client-side React app (static export compatible)
- Password gate before showing CMS
- Tabs: Posts (table with CRUD), Topics (list with delete), Settings (form)
- Fetches from API server at `NEXT_PUBLIC_AGENT_URL` (replace `/chat` with `/admin/*`)
- Responsive design matching site theme
- Forms for creating/editing posts with title, slug, excerpt, content, tags, category

## Criteria

### Chat Widget UI
- [x] ISC-1: Chat auto-scrolls smoothly to newest message on every update
- [x] ISC-2: Typing animation shows 3 animated dots while AI responds
- [x] ISC-3: Widget uses modern glassmorphism design with dark theme
- [x] ISC-4: Widget design adapts to light theme via ThemeContext
- [x] ISC-5: Header shows real-time status indicator (online/typing/offline)
- [x] ISC-6: All text has proper RTL Hebrew alignment throughout widget
- [x] ISC-7: Input supports multiline with Shift+Enter and single Enter to send
- [x] ISC-8: Widget width is 100vw max on mobile screens below 480px
- [x] ISC-9: Floating button pulses when there are unread messages
- [x] ISC-10: Proactive greeting message appears after 30 seconds on first visit

### Telegram Live Handoff (Two-Way)
- [x] ISC-11: Server exposes /webhook endpoint for Telegram bot updates
- [x] ISC-12: Admin reply in Telegram thread is pushed to matching web session
- [x] ISC-13: Each chat session has unique sessionId stored in localStorage
- [x] ISC-14: Customer sees notification when live human agent joins conversation
- [x] ISC-15: Admin receives full conversation history in Telegram on handoff
- [x] ISC-16: Web client polls /messages/{sessionId} every 3 seconds for replies
- [x] ISC-17: Webhook validates Telegram secret token before processing
- [x] ISC-18: Handoff state resets when customer types "סיים שיחה" or closes chat

### CMS Full CRUD
- [x] ISC-19: CMS page at /admin lists all blog posts in responsive table
- [x] ISC-20: CMS allows creating new blog post with title, excerpt, content fields
- [x] ISC-21: CMS allows editing any existing post field and saving changes
- [x] ISC-22: CMS allows deleting post with confirmation dialog
- [x] ISC-23: CMS shows topics list from content/topics.json with delete button
- [x] ISC-24: CMS allows updating agent system prompt and service prices
- [x] ISC-25: CMS is password-protected with HTTP Basic Auth middleware
- [x] ISC-26: CMS write operations persist to JSON files on disk immediately
- [x] ISC-27: CMS table shows post metadata (date, category, word count, tags)
- [x] ISC-28: CMS has navigation between Posts, Topics, and Settings sections

### Anti-Criteria
- [x] ISC-A-1: No external database or Redis required for any feature
- [x] ISC-A-2: No breaking changes to existing static build process

## Verification

- ISC-1: `requestAnimationFrame` + `scrollTo({ behavior: 'smooth' })` in SalesAgent.tsx:68-71
- ISC-2: `animate-bounce` dots with staggered delays in SalesAgent.tsx:304-312
- ISC-3: `backdrop-blur-xl bg-gray-950/95 border-white/10` classes applied in SalesAgent.tsx:203-208
- ISC-4: `useTheme()` hook consumed, conditional `isDark` classes throughout SalesAgent.tsx
- ISC-5: Green/yellow/blue status dots in header, SalesAgent.tsx:217-236
- ISC-6: `dir="rtl"` on root div, Hebrew text throughout
- ISC-7: `textarea` with `handleKeyDown` checking `!e.shiftKey` in SalesAgent.tsx:178-183
- ISC-8: `isMobile` state sets `w-[calc(100vw-2rem)]` in SalesAgent.tsx:201-203
- ISC-9: `animate-pulse ring-4 ring-purple-500/50` when `unread > 0` in SalesAgent.tsx:352-354
- ISC-10: `setTimeout 30000` with `localStorage` flag `chat_greeted` in SalesAgent.tsx:91-104
- ISC-11: `pathname === '/webhook'` handler in api/server.js:366-397
- ISC-12: `addMessage(sessionId, { from: 'admin' })` when webhook matches Session ID in api/server.js:388-389
- ISC-13: `getSessionId()` reads/creates `chat_session_id` in localStorage in SalesAgent.tsx:23-30
- ISC-14: Blue banner "יוסף אלישר מחובר לשיחה" with ping animation in SalesAgent.tsx:247-259
- ISC-15: `formatTelegram()` includes full message history in api/server.js:121-127
- ISC-16: `setInterval(poll, 3000)` fetches `/messages/${sessionId}` in SalesAgent.tsx:137-169
- ISC-17: `X-Telegram-Bot-Api-Secret-Token` compared against `WEBHOOK_SECRET` in api/server.js:373-378
- ISC-18: `resetConversation()` removes localStorage keys, resets state; triggered by button or typing "סיים שיחה" in SalesAgent.tsx:174-188 and sendMessage check
- ISC-19: `/admin` page renders table with posts fetched from `/admin/posts` in src/app/admin/page.tsx
- ISC-20: PostEditor modal with form fields for new post creation in src/app/admin/page.tsx
- ISC-21: `PUT /admin/posts/:slug` endpoint + edit button in admin page
- ISC-22: `confirm()` dialog + `DELETE /admin/posts/:slug` endpoint
- ISC-23: Topics tab reads `content/topics.json` and shows delete buttons
- ISC-24: Settings tab with textarea for `systemPrompt` + `POST /admin/settings`
- ISC-25: `basicAuth` middleware checks `Authorization: Basic` header on all `/admin/*` in api/server.js:159-172
- ISC-26: `fs.writeFileSync` used immediately in all CMS POST/PUT/DELETE handlers in api/server.js
- ISC-27: Table columns show date, category, wordCount for each post in admin page
- ISC-28: Tab buttons for Posts, Topics, Settings in admin page header
- ISC-A-1: All state stored in-memory (Map) or JSON files on disk; no DB/Redis
- ISC-A-2: `npm run build` passes successfully; all pages static-exported