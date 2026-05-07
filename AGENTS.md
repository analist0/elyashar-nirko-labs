# AI Agent Instructions - Joseph Elyashar Portfolio

This file contains critical information for AI coding agents working on Joseph Elyashar's portfolio project. Read before making any changes.

## 🎯 Project Overview

**Project Name:** `joseph-elyashar-portfolio`  
**Type:** Personal Portfolio Website + Automated SEO Blog Machine  
**Technology Stack:** Next.js 14 (React 18), TypeScript, Tailwind CSS, Framer Motion  
**Purpose:** Showcase AI/Full-Stack development skills with automatic content generation

### Core Features
- **Multi-language:** Primarily Hebrew (RTL) with English support
- **Theme System:** Dark/Light mode toggle with persistent storage
- **SEO Blog Machine:** Automatically generates daily blog posts from GitHub trending repositories
- **Interactive UI:** Canvas particle effects, animations, scroll-based transforms
- **Static Export:** Deployed to GitHub Pages

---

## 🔧 Technology Stack & Dependencies

### Core Technologies
- **Next.js 14.2.0** with React 18.2.0 (App Router)
- **TypeScript 5.3** (strict mode disabled)
- **Tailwind CSS 3.4** with custom animations and RTL support
- **Deployed to GitHub Pages** using static export

### Key Dependencies
- `framer-motion` - Animation and scroll effects
- `lucide-react` - Icons
- `react-countup` - Animated counters
- `react-intersection-observer` - Scroll-triggered animations

### Environments
- **Development:** Node.js 20+ required
- **Build Output:** Static export to `./dist` directory
- **Styling:** Tailwind with dark mode plugin (default: dark)

---

## 📁 Code Organization & Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with RTL config
│   ├── page.tsx          # Home page with component sections
│   └── globals.css       # Global styles and component styles
├── context/              # React Context
│   └── ThemeContext.tsx  # Dark/light theme provider
├── lib/                  # Utilities (currently empty)

components/              # React components (shared)
├── ContactSection.tsx
├── HeroSection.tsx      # Particle canvas animation
├── Navigation.tsx
├── ProjectsSection.tsx
├── ServicesSection.tsx
├── SkillsSection.tsx
├── StatsSection.tsx
└── ThemeToggle.tsx

content/                 # Generated blog content
├── posts/              # Generated .md files
└── topics.json         # Tracked topics (deduplication)

scripts/                # Automation scripts
├── generate-content.ts # Main SEO content generator
├── generate-images.ts  # Image generation for posts
└── test-kimi-*.ts      # API testing scripts

.github/workflows/
└── generate-blog-post.yml # Daily cron + deployment
```

### Component Architecture
- **All components are client-side** (`'use client'` directive)
- **Section-based layout:** Each section is a self-contained component
- **No state management library:** Uses React Context for theme only
- **Performance:** Lazy-loaded animations via Intersection Observer

---

## 🏗️ Build Process & Commands

### Available Scripts (package.json)
```bash
npm run dev      # Next.js dev server on localhost:3000
npm run build    # Build static export to ./dist
npm run start    # Start production server
npm run export   # Explicit static export (same as build)
```

### Build Configuration
- **Output:** Static export (`output: 'export'`)
- **Dist Directory:** `./dist` (not the default `.next`)
- **Images:** Unoptimized (for static export compatibility)
- **Trailing Slash:** Enabled for GitHub Pages routing
- **CDN:** Assets remain relative paths

### Build Steps (in CI/GH Actions):
1. `npm ci` - Install dependencies
2. `npm run build` - Generate static export in `./dist`
3. Upload `./dist` to GitHub Pages

---

## 🚀 Deployment & CI/CD

### GitHub Actions Workflow (`.github/workflows/generate-blog-post.yml`)

**Daily Automation (9:00 AM Israel Time):**
1. **Generate Post:** `scripts/generate-content.ts` fetches trending repos
2. **Deduplication:** Checks `content/topics.json` to avoid repeats
3. **AI Content:** Generates Hebrew installation guides via LLM
4. **Push Changes:** Commits new content to repository
5. **Build & Deploy:** Builds Next.js and deploys to GitHub Pages

**Manual Trigger:** Available via workflow_dispatch

### GitHub Pages Configuration
- **Source:** GitHub Actions (not branch-based)
- **Custom Domain:** Not configured (uses github.io)
- **SSL:** Automatic via GitHub
- **URL Format:** `https://[username].github.io/joseph-elyashar-portfolio/[slug]/`

---

## 🧪 Testing Strategy

**Current State:** No formal test suite exists

### Manual Testing Required For:
- **RTL Layout:** Hebrew text, right-to-left navigation
- **Theme Toggle:** Dark/light transitions and localStorage persistence
- **Build Export:** Verify static export completes without errors
- **GitHub Pages:** Check routing with trailing slashes
- **Particle Canvas:** Performance on various screen sizes

### Testing Recommendations:
1. Run `npm run build` locally before pushing
2. Test theme toggle across page reloads
3. Verify Hebrew text renders correctly
4. Check mobile responsiveness

---

## 🎨 Code Style Guidelines

### TypeScript Configuration
- **Strict Mode:** OFF (`"strict": false`)
- **Target:** ESNext with node resolution
- **JSX:** Preserve (for Next.js processing)
- **Incremental:** Enabled for faster builds

### Styling Conventions
- **Framework:** Tailwind CSS exclusively
- **Dark Mode:** Use `dark:` prefix variants
- **RTL Support:** Leverage Tailwind's RTL-aware utilities
- **Custom Animations:** Defined in `tailwind.config.js`
- **Color System:** Custom primary/cyan palette (see tailwind.config.js)

### React Patterns
- **Components:** Capitalized, in PascalCase
- **Props:** Explicitly typed with interfaces
- **State:** Use `useState` hooks, avoid class components
- **Effects:** Use `useEffect` for client-side logic
- **Imports:** Type imports first, then React, then components

### File Naming
- **Components:** `PascalCase.tsx`
- **Pages:** `page.tsx` (Next.js convention)
- **Layouts:** `layout.tsx`
- **Scripts:** `kebab-case.ts`
- **Content:** `YYYY-MM-DD-slug.md`

---

## 🤖 SEO Content Machine

### Core Functionality (scripts/generate-content.ts)
**Automated Daily Pipeline:**
1. Fetches 20 trending GitHub repositories
2. Filters for Hebrew-relevant content (tech topics)
3. Checks `topics.json` for duplicate prevention
4. Generates 1000+ word Hebrew installation guide
5. Creates featured image using AI
6. Saves to `content/posts/YYYY-MM-DD-slug.md`
7. Updates `topics.json` tracking

### Content Structure
```markdown
---
title: "[Hebrew Title]"
date: "YYYY-MM-DD"
excerpt: "[Generated summary]"
category: "[Tech Category]"
image: "[Generated URL]"
readTime: "X min"
tags: [tag1, tag2, tag3]
source: "github"
githubUrl: "https://github.com/..."
---

[Full Hebrew guide with installation steps]
```

### Deduplication System
- **Tracking File:** `content/topics.json`
- **Format:** `{ "topics": ["topic1", "topic2"] }`
- **Scope:** Topics never repeat (cross-platform)

---

## 🔐 Security Considerations

### Environment Variables
- **Sensitive File:** `.env.local` (blocked from reading)
- **Public Template:** `.env.local.example` (contains placeholders)
- **Used In:** Content generation scripts (Kimi API)
- **Never Commit:** Real API keys to repository

### GitHub Actions Security
- **Token Usage:** `GITHUB_TOKEN` for commits (built-in, rotated)
- **Secrets:** Stored in GitHub repository settings
- **Permissions:** Minimal required scope (contents: write, pages: write)

### Static Export Security
- **No Server-Side:** All processing happens at build time
- **API Keys:** Never exposed to client (only in build scripts)
- **Public Files:** All in `./dist` are publicly accessible

---

## 🔧 Development Workflow

### Local Development
```bash
# Initial setup
npm install

# Create .env.local (see .env.local.example)
# Add required API keys

# Run dev server
npm run dev

# Test build
npm run build

# Check output
ls -la dist/
```

### Making Changes
1. **Components:** Edit files in `components/` or `src/app/`
2. **Styling:** Modify Tailwind classes or `globals.css`
3. **Animations:** Update `tailwind.config.js` keyframes
4. **Content:** Modify scripts in `scripts/` directory
5. **Deployment:** Check `.github/workflows/` for CI changes

### Adding New Sections
1. Create new component in `components/`
2. Add `'use client'` directive
3. Import in `src/app/page.tsx`
4. Test theme compatibility
5. Verify mobile responsiveness

---

## 📋 RTL & Hebrew-Specific Notes

### Technical Implementation
- **HTML Attribute:** `<html lang="he" dir="rtl">`
- **Tailwind:** RTL-aware utilities work automatically
- **Text Alignment:** Right-aligned by default in RTL mode
- **Icons:** Some icons may need explicit flipping

### Content Strategy
- **Primary Language:** Hebrew (posts, UI text)
- **Technical Terms:** Often kept in English with Hebrew explanation
- **Code Comments:** Not used in generated content (Markdown format)

---

## 🚨 Common Issues & Solutions

### Build Fails: Image Optimization
**Problem:** Next.js image optimization not available in static export
**Solution:** Using `unoptimized: true` in next.config.js (already configured)

### Theme Flash on Load
**Problem:** Theme preference loads after initial render
**Solution:** ThemeContext handles mounted state, shows dark by default

### Routing Issues on GitHub Pages
**Problem:** Direct URL access returns 404
**Solution:** `trailingSlash: true` in next.config.js ensures proper routing

### Particle Canvas Performance
**Problem:** Heavy animation on low-end devices
**Solution:** Canvas size capped by window dimensions, 80 particles max

---

## 📚 Additional Documentation

- **SEO_CONTENT_MACHINE.md** - Detailed automation documentation (Hebrew)
- **PROJECT_SUMMARY.md** - Project status and roadmap (Hebrew)
- **.env.local.example** - Environment variables template
- **content/topics.json** - Current topics tracking
- **content/posts/** - Generated blog posts archive

---

## ✨ Pro Tips for AI Agents

1. **Always test theme toggle** after UI changes
2. **Verify RTL layout** when modifying components
3. **Run `npm run build`** before considering task complete
4. **Check GitHub Actions logs** if deployment fails
5. **Never expose API keys** in client-side code
6. **Use Hebrew** for user-facing content and comments
7. **Preserve animation performance** - avoid heavy computations in render
8. **Maintain deduplication** - always check topics.json before manual content
9. **Test on mobile viewports** - portfolio is responsive
10. **Backup topics.json** before bulk content changes

---

**Last Updated:** 2026-05-07  
**Status:** Active Development (Automated)  
**Priority:** Maintain daily automation, ensure site stability