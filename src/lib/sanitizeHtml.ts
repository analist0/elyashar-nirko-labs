import DOMPurify from 'isomorphic-dompurify'

// Formatting tags actually produced by the content pipeline (scripts/generate-content.ts)
// and the admin CMS editor. `class` is allowed because CanvasBlockRenderer injects
// Tailwind classes into table/list markup before sanitizing; `style` is intentionally
// excluded (CSS-based exfiltration/injection vector, and unused by the app).
const ALLOWED_TAGS = [
  'a', 'b', 'strong', 'i', 'em', 'u', 's', 'mark', 'sup', 'sub',
  'br', 'span', 'code',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'id']

/**
 * Sanitizes HTML from blog posts (LLM-generated or admin-edited via the CMS)
 * before it is passed to dangerouslySetInnerHTML. Strips scripts, event handlers,
 * javascript: URLs, and any tag/attribute not on the allowlist above.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  })
}
