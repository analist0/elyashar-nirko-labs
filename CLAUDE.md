# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Next.js dev server on localhost:3000
npm run build      # Runs scripts/generate-seo.ts, then `next build` → static export to ./dist
npm run start       # Serve the production build (after build)
npm run generate    # Run the content pipeline once: npx tsx scripts/generate-content.ts
npm run pipeline     # bash scripts/run-daily-blog.sh (wraps `generate`, used by cron/PM2)
npm test              # vitest run — unit tests for src/lib/** and api/lib/**
```

Test coverage is intentionally narrow (pure-logic helpers only, e.g. `src/lib/sanitizeHtml.ts` and `api/lib/adminAuth.js`) — there's no component/integration test setup. Validate broader changes with `npm run build` and manual browser testing. The API backend (`api/server.js`) has no build step — just restart it (`node api/server.js` or `pm2 restart api-server`) to pick up changes.

## Architecture

This repo is **two runtime pieces deployed independently**, not a single app:

1. **Static frontend** — Next.js 14 App Router, `output: 'export'`, `distDir: 'dist'` (`next.config.js`). No server-side rendering, no API routes, no `next/image` optimization (`unoptimized: true`). Everything must be build-time safe.
2. **Long-running Node API** (`api/server.js`) — a dependency-free `http` server on port 3004 (no Express). Handles the sales chatbot, lead capture, comments, a Telegram webhook, and the CMS admin API. It is process-managed by PM2 (`ecosystem.config.js`, apps `api-server` + `static-site`) alongside the built static site, and is a separate deployable from the Next.js build.

**Production deployment is NOT GitHub Pages.** The `.github/workflows/build-deploy.yml` workflow (push to `main` → GitHub Pages) exists but is effectively unused; `.github/workflows/generate-blog-post.yml` explicitly documents that the real production site runs on the owner's private server via Docker/nginx (`Dockerfile`, `docker-compose.yml`, `deploy.sh`, port 3003) and PM2, with GitHub used only for backup/testing. Keep this in mind before assuming a push to `main` deploys anything live.

### Frontend structure

- `src/app/page.tsx` assembles the home page from self-contained `'use client'` section components in `components/` (Hero, Services, Skills, Projects, Team, Stats, Contact, Navigation).
- Theme (dark/light) flows through `src/context/ThemeContext.tsx`; dark is the default to avoid flash-of-wrong-theme.
- `components/TelegramChatWidget.tsx` (chat bubble) and `components/ContactSection.tsx` (contact form) both POST to the API backend's `/widget-message` (derived from `NEXT_PUBLIC_AGENT_URL` by swapping `/chat` for `/widget-message`) rather than calling the Telegram Bot API directly — bot tokens must stay server-side (`api/lib/telegramRecipients.js`), never in client code, which ships as plain text to every visitor.
- `components/CommentsSection.tsx` reads/writes via the API backend's `/comments/:slug` endpoints (file-backed, not build-time).
- `components/CanvasBlockEditor.tsx` / `CanvasBlockRenderer.tsx` render/edit the rich "block" content format used by generated blog posts (mixed HTML sections + per-section images), used by both the blog detail page and the admin CMS editor. Post HTML is LLM-generated and admin-editable, so `CanvasBlockRenderer` runs every block through `src/lib/sanitizeHtml.ts` (DOMPurify, tag/attribute allowlist) before any `dangerouslySetInnerHTML` — code blocks are rendered as plain text instead, never as HTML. Extend the allowlist there (not ad hoc per call site) if a new block type needs a new tag/attribute.
- `src/app/admin/page.tsx` is a client-side CMS UI (posts, topics, comments, logs, pipeline trigger, settings) that talks to `api/server.js`'s `/admin/*` routes, which are Basic-Auth protected (`ADMIN_USER`/`ADMIN_PASS`, resolved by `api/lib/adminAuth.js` — **the server refuses to start** with `NODE_ENV=production` unless both are set; no insecure fallback in prod).

### Blog system

Posts are JSON files in `content/posts/` (not Markdown), each matching the `Post` interface in `src/lib/posts.ts` (`getAllPosts`/`getPostBySlug`/`getAllSlugs`, read via `fs` at build time). Routes: `src/app/blog/page.tsx` (listing), `src/app/blog/[slug]/page.tsx` (detail, renders `sections` via `CanvasBlockRenderer`, plus JSON-LD/OG metadata). Adding a post manually = dropping a `.json` file into `content/posts/`; in practice posts are produced by the content pipeline below.

### Content generation pipeline

`scripts/generate-content.ts` is the entry point (`npm run generate`, or triggered from the admin UI via `POST /admin/generate-content`, which shells out to it and holds a lock file at `/tmp/ucm-admin.lock` to prevent concurrent runs):

1. Fetches trending GitHub repos (`GITHUB_TOKEN`).
2. Checks `content/topics.json` to avoid regenerating a topic.
3. Generates a Hebrew installation-guide-style post via Ollama (`scripts/ollama-ai.ts`, model configured by `OLLAMA_MODEL`, default `kimi-k2.5`).
4. Generates per-section images via `scripts/generate-images.ts`, primarily through fal.ai FLUX (`scripts/fal-ai.ts`, `FAL_KEY`/`FAL_MODEL`) with a Pollinations.ai fallback (`SKIP_FAL_AI=true` forces the fallback); saved into `public/images/generated/`.
5. Writes `content/posts/<slug>.json` and updates `content/topics.json`.

`scripts/cloudflare-ai.ts` and `workers/sales-agent.ts` are a **standalone alternative** chat backend (Cloudflare Worker + Workers AI, deployed separately via `wrangler`) — not part of the Next.js build (`workers/` has its own `package.json` and is excluded from the root `tsconfig.json`). `python-api/` (FastAPI image service) is a legacy/unused service not wired into `generate-content.ts` or `api/server.js` — don't assume it's running.

On GitHub Actions, the daily cron (`generate-blog-post.yml`, 9 AM Israel time / 6 AM UTC) only *generates and commits* content for backup — it does not build or deploy. On the production server, `scripts/run-daily-blog.sh` (via `npm run pipeline`, invoked by cron or the admin UI) runs generation and then a build.

### API backend (`api/server.js`)

Single-file Node HTTP server, no framework, in-memory session/rate-limit state (lost on restart):
- `POST /chat` — sales agent, forwards to Ollama Cloud (`OLLAMA_API_KEY`) with a hardcoded Hebrew sales system prompt; replies containing `HANDOFF` trigger a Telegram notification (`TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`) and enable a human takeover flow.
- `POST /webhook` — Telegram bot webhook; an admin reply in Telegram (matched by `Session: <id>` in the message) is relayed back into the chat session.
- `GET/POST /comments/:slug` — file-backed comments in `content/comments/<slug>.json`, rate-limited and HTML-escaped.
- `POST /lead` — fire-and-forget Telegram notification for any CTA/lead-capture form.
- `POST /widget-message` — rate-limited Telegram notification for the chat widget and contact form (`api/lib/telegramRecipients.js`: `TELEGRAM_RECIPIENTS` JSON array, or the single `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` pair; optional `target` field narrows to one recipient by `id`, e.g. picking a specific partner).
- `/admin/*` — Basic-Auth CMS API: CRUD on `content/posts/*.json` and `content/topics.json`, comment moderation, log viewing, and triggers for content generation (`/admin/generate-content`) and rebuild (`/admin/build`, which also reloads the PM2 `static-site`/`api-server` processes).

## Key Constraints

- **RTL/Hebrew:** `<html lang="he" dir="rtl">` — primary language is Hebrew; all user-facing content (UI copy, generated posts, chatbot) should be Hebrew. Tailwind RTL utilities apply automatically.
- **TypeScript strict mode is OFF** — `"strict": false` in `tsconfig.json`; `workers/` is excluded from the root tsconfig (it's a separate TS project for Cloudflare).
- **Static export limits:** no `next/image` optimization, no server actions, no Next.js API routes — anything dynamic (chat, comments, admin, leads) must go through `api/server.js`, not through Next.js itself.
- **Styling:** Tailwind CSS only; custom color palette and animations are defined in `tailwind.config.js`.
- **Environment:** `.env.local` (see `.env.local.example`) holds API keys (`FAL_KEY`, `GITHUB_TOKEN`, `OLLAMA_API_KEY`, `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_AGENT_URL`, `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`) used by `scripts/` and `api/server.js`. Only `NEXT_PUBLIC_*` vars are baked into the client bundle — everything else must stay server/script-side.
