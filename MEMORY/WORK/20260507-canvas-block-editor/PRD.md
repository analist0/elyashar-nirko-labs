---
task: Build Canvas block editor and security
slug: 20260507-canvas-block-editor
effort: comprehensive
phase: observe
progress: 0/64
mode: interactive
started: 2026-05-07T12:10:00Z
updated: 2026-05-07T12:10:00Z
---

## Context

The user wants the most impressive Canvas (block-based) editor experience for his portfolio blog. He explicitly stated the current work is "not 10% of what I want". He demands:

1. **Canvas / Block editor** — Notion-like block-based rendering of articles (paragraph, heading, code, image, quote, table, divider, callout, list blocks)
2. **Modern Markdown** — Rich markdown support that converts to blocks
3. **Block components** — Each block type is a distinct visual component with animations
4. **Comments without registration** — Anonymous commenting system under each post
5. **Security** — Protection against XSS, injections, and common attacks
6. **Local SEO** — Rank #1 for "AI ברמת גן" and related terms

Constraints:
- Next.js 14 with static export (output: 'export')
- No database for static site; API server exists for dynamic features
- Hebrew RTL throughout
- All existing content is HTML strings in JSON files

## Criteria

### Canvas Block Renderer (Blog Post Reading)
- [ ] ISC-1: Block renderer component parses HTML content into typed blocks
- [ ] ISC-2: Heading block renders with anchor link and smooth scroll
- [ ] ISC-3: Paragraph block renders with proper typography and RTL
- [ ] ISC-4: Code block renders with syntax highlight, language label, copy button
- [ ] ISC-5: Image block renders with lazy loading, click-to-expand, caption
- [ ] ISC-6: Quote/callout block renders with colored left border and icon
- [ ] ISC-7: Table block renders with responsive horizontal scroll and zebra striping
- [ ] ISC-8: Divider block renders as animated gradient line
- [ ] ISC-9: List block renders with custom bullets and RTL indentation
- [ ] ISC-10: Each block has subtle fade-in animation on scroll
- [ ] ISC-11: Table of contents sidebar auto-generates from headings
- [ ] ISC-12: Reading progress bar updates per section (not just page)

### Canvas Block Editor (CMS Admin)
- [ ] ISC-13: Block editor renders existing post as editable blocks in admin
- [ ] ISC-14: Admin can add new block via slash command menu (/heading, /code, etc.)
- [ ] ISC-15: Admin can delete any block with confirmation
- [ ] ISC-16: Admin can reorder blocks via drag handles
- [ ] ISC-17: Each block type has inline editing interface
- [ ] ISC-18: Editor exports final content as HTML string for JSON storage
- [ ] ISC-19: Editor preview mode shows how post will look to readers
- [ ] ISC-20: Auto-save drafts to localStorage every 10 seconds

### Anonymous Comments System
- [ ] ISC-21: Comment form appears at bottom of each blog post
- [ ] ISC-22: Users can comment without registration (name + email optional)
- [ ] ISC-23: Comments are stored server-side via API (JSON file per post)
- [ ] ISC-24: GET /comments/:slug endpoint returns comments sorted by date
- [ ] ISC-25: POST /comments/:slug endpoint accepts anonymous comment
- [ ] ISC-26: Comments display with avatar placeholder, name, date, content
- [ ] ISC-27: Basic spam protection via honeypot field
- [ ] ISC-28: Comments have RTL Hebrew rendering

### Security
- [ ] ISC-29: HTML content is sanitized before rendering (DOMPurify)
- [ ] ISC-30: CSP meta tag added to all pages
- [ ] ISC-31: X-Frame-Options header configured
- [ ] ISC-32: Input fields escape/sanitize user input
- [ ] ISC-33: API server validates and sanitizes all incoming data
- [ ] ISC-34: Rate limiting on comment submission (1 per 30 seconds per IP)
- [ ] ISC-35: No eval() or dangerous DOM operations in client code

### Local SEO
- [ ] ISC-36: LocalBusiness structured data added to homepage
- [ ] ISC-37: Service schema markup for each service offered
- [ ] ISC-38: FAQ schema markup on homepage
- [ ] ISC-39: BreadcrumbList schema on blog post pages
- [ ] ISC-40: robots.txt generated with sitemap reference
- [ ] ISC-41: sitemap.xml generated at build time with all routes
- [ ] ISC-42: OpenGraph locale set to he_IL
- [ ] ISC-43: meta description under 160 chars for all pages
- [ ] ISC-44: Canonical URLs set for all pages

### Anti-Criteria
- [ ] ISC-A-1: No breaking changes to existing static build process
- [ ] ISC-A-2: No external database required (use JSON files or API server memory)
- [ ] ISC-A-3: No eval() or innerHTML with unsanitized content
