# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server on localhost:3000
npm run build     # Static export to ./dist (production)
npm run start     # Start production server (after build)
```

No test suite exists. Validate changes with `npm run build` and manual browser testing.

## Architecture

**Next.js 14 App Router** with full static export (`output: 'export'`, `distDir: 'dist'`). Deployed to GitHub Pages — no server-side runtime, everything must be build-time safe.

All page sections are self-contained `'use client'` components in `components/`. The root page (`src/app/page.tsx`) assembles them. Theme (dark/light) flows through `src/context/ThemeContext.tsx`.

**Blog system:** Posts are JSON files in `content/posts/`. `src/lib/posts.ts` reads them at build time via `fs`. Routes live in `src/app/blog/page.tsx` (listing) and `src/app/blog/[slug]/page.tsx` (detail). Adding a post = dropping a `.json` file into `content/posts/`.

**Automated content pipeline:** `scripts/generate-content.ts` runs daily via `.github/workflows/generate-blog-post.yml` (cron, 9 AM Israel time). It fetches GitHub trending repos, generates Hebrew installation guides via Kimi API, prevents duplicates via `content/topics.json`, and commits + deploys automatically.

## Key Constraints

- **RTL/Hebrew:** `<html lang="he" dir="rtl">` — primary language is Hebrew; all user-facing content should be Hebrew. Tailwind RTL utilities apply automatically.
- **TypeScript strict mode is OFF** — `"strict": false` in `tsconfig.json`.
- **Static export limits:** No `next/image` optimization (uses `unoptimized: true`), no server actions, no API routes.
- **Styling:** Tailwind CSS only; custom color palette and animations are defined in `tailwind.config.js`.
- **Environment:** `.env.local` holds the Kimi API key used only by `scripts/` — never exposed to the browser bundle.
