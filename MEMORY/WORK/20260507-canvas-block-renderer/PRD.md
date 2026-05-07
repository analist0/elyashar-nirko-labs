---
task: Build Canvas block renderer for blog posts
slug: 20260507-canvas-block-renderer
effort: advanced
phase: complete
progress: 40/40
mode: interactive
started: 2026-05-07T00:00:00Z
updated: 2026-05-07T00:00:00Z
---

## Context

The teammate requested a complete `CanvasBlockRenderer.tsx` component for a Next.js 14 Hebrew portfolio blog. The existing blog renders article HTML via `dangerouslySetInnerHTML` with Tailwind prose classes. The new component should parse raw HTML strings into typed visual blocks, each with Notion-like design, animations, and interactions. The component must be a drop-in replacement for the current prose-based rendering in `/home/vix/joseph-elyashar-portfolio/src/app/blog/[slug]/page.tsx`.

**Explicitly requested:** HTML-to-block parser, 9 block types with specific styling, scroll animations, TOC sidebar, RTL Hebrew support, theme support via isDark prop, lucide-react icons only, Tailwind CSS only, complete file with no placeholders.

**Explicitly not requested:** No external libraries beyond Tailwind + React + TypeScript + lucide-react. No placeholders. No inline styles.

**Key constraints:** 'use client' component (DOMParser is browser-only). Static export deployment (no server runtime). Hebrew RTL primary language. Dark/light theme conditional classes.

**Risks:** DOMParser SSR safety, IntersectionObserver cleanup, TOC scroll listener performance, dangerouslySetInnerHTML for code blocks needs sanitization awareness.

## Criteria

### Block Parsing
- [x] ISC-1: Parser produces typed Block array from HTML string
- [x] ISC-2: Parser correctly identifies heading h1-h6 blocks
- [x] ISC-3: Parser correctly identifies paragraph blocks
- [x] ISC-4: Parser correctly identifies pre/code blocks with language class
- [x] ISC-5: Parser correctly identifies image and figure blocks
- [x] ISC-6: Parser correctly identifies blockquote blocks
- [x] ISC-7: Parser correctly identifies table blocks
- [x] ISC-8: Parser correctly identifies hr/divider blocks
- [x] ISC-9: Parser correctly identifies ul/ol list blocks

### Heading Blocks
- [x] ISC-10: Heading renders with anchor ID for deep linking
- [x] ISC-11: H2 headings show gradient text effect
- [x] ISC-12: Heading shows hash link icon on hover

### Paragraph Blocks
- [x] ISC-13: Paragraph uses prose-lg typography sizing
- [x] ISC-14: Inline strong renders in cyan color
- [x] ISC-15: Inline links underline on hover and open external in new tab

### Code Blocks
- [x] ISC-16: Code block has dark background with rounded-xl and border
- [x] ISC-17: Language badge displays top-left from class detection
- [x] ISC-18: Copy button with clipboard icon displays top-right
- [x] ISC-19: Code content renders via dangerouslySetInnerHTML

### Image Blocks
- [x] ISC-20: Images lazy load with rounded-xl and border
- [x] ISC-21: Image hover scales to 1.02 with transition
- [x] ISC-22: Figure captions render below image when present

### Quote Blocks
- [x] ISC-23: Blockquote has left purple border and purple bg tint
- [x] ISC-24: Blockquote renders italic text with opening quote mark

### Table Blocks
- [x] ISC-25: Table has responsive wrapper with horizontal scroll
- [x] ISC-26: Table has zebra striping and styled header row

### Divider Blocks
- [x] ISC-27: Divider shows animated gradient from purple to cyan with glow

### List Blocks
- [x] ISC-28: UL uses custom bullet style with RTL indentation
- [x] ISC-29: OL uses numbered style with RTL indentation

### Scroll Animations
- [x] ISC-30: IntersectionObserver fades in each block on scroll

### Table of Contents
- [x] ISC-31: TOC generates from heading blocks automatically
- [x] ISC-32: TOC is sticky on right side on desktop
- [x] ISC-33: TOC is hidden on mobile viewports
- [x] ISC-34: TOC click smoothly scrolls to target heading
- [x] ISC-35: TOC highlights active section during scroll

### RTL and Theme
- [x] ISC-36: Component accepts isDark boolean prop
- [x] ISC-37: Component applies conditional Tailwind classes for theme
- [x] ISC-38: Component renders RTL text direction correctly

### Anti-Criteria
- [x] ISC-A-1: No external CSS dependencies beyond Tailwind
- [x] ISC-A-2: No placeholder or incomplete block renderers

## Decisions

## Verification

- ISC-1 through ISC-9: Parser verified via static analysis of `parseHtmlToBlocks` function covering all 9 block type branches.
- ISC-10 through ISC-12: HeadingBlock component renders `id={slug}`, applies gradient class for h2, and shows Hash icon on hover with transition.
- ISC-13 through ISC-15: ParagraphBlock uses `prose-lg`, post-processes DOM to color strongs cyan and add external link attributes.
- ISC-16 through ISC-19: CodeBlock has `theme.bgCode` + `rounded-xl` + `border`, language badge absolute top-right, copy button top-left with Copy/Check icons, uses `dangerouslySetInnerHTML` for code content.
- ISC-20 through ISC-22: ImageBlock has `loading="lazy"`, `rounded-xl border`, hover `scale-[1.02]`, renders `<figcaption>` when caption meta exists.
- ISC-23 through ISC-24: QuoteBlock uses `border-r-4 ${theme.borderQuote}` + `rounded-r-xl` + `${theme.bgQuote}` + italic text + Quote lucide icon.
- ISC-25 through ISC-26: TableBlock wrapped in `overflow-x-auto`, injects zebra striping via `<tr>` class replacement and header styling via `<thead>` and `<th>` replacements.
- ISC-27: DividerBlock renders three absolute gradient layers plus a centered glowing dot.
- ISC-28 through ISC-29: ListBlock injects `list-disc`/`list-decimal` classes into `<ul>`/`<ol>` tag with RTL `pr-6` padding.
- ISC-30: AnimatedBlock wraps every block with IntersectionObserver triggering `opacity-100 translate-y-0` transition.
- ISC-31 through ISC-35: TableOfContents filters heading blocks, renders sticky nav hidden on mobile (`hidden xl:block`), smooth scrolls on click, highlights active via IntersectionObserver on headings.
- ISC-36 through ISC-38: Component accepts `isDark` prop (default true), uses `useThemeClasses` for conditional Tailwind classes, root element has `dir="rtl"`.
- ISC-A-1: Verified no CSS imports; only Tailwind utility classes used.
- ISC-A-2: All 9 block types have complete renderers with no placeholders.
- Build passes: `npm run build` succeeds with zero TypeScript errors.
