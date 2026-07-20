import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from './sanitizeHtml'

describe('sanitizeHtml', () => {
  it('strips <script> tags entirely', () => {
    const out = sanitizeHtml('<p>hello</p><script>alert(document.cookie)</script>')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('alert')
  })

  it('strips inline event handler attributes', () => {
    const out = sanitizeHtml('<a href="/x" onclick="alert(1)">click</a>')
    expect(out).not.toContain('onclick')
  })

  it('strips javascript: URLs from href', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    expect(out).not.toContain('javascript:')
  })

  it('strips img tags with onerror payloads (not on the allowlist)', () => {
    const out = sanitizeHtml('<img src=x onerror="alert(1)">')
    expect(out).not.toContain('onerror')
    expect(out).not.toContain('<img')
  })

  it('strips disallowed custom/unknown tags used as XSS vectors', () => {
    const out = sanitizeHtml('<svg onload="alert(1)"></svg><iframe src="evil.com"></iframe>')
    expect(out).not.toContain('<svg')
    expect(out).not.toContain('<iframe')
    expect(out).not.toContain('onload')
  })

  it('keeps legitimate inline formatting tags used by generated posts', () => {
    const out = sanitizeHtml('<strong>bold</strong> and <em>emphasis</em> and <a href="https://example.com">link</a>')
    expect(out).toContain('<strong>bold</strong>')
    expect(out).toContain('<em>emphasis</em>')
    expect(out).toContain('href="https://example.com"')
  })

  it('preserves class attributes injected by CanvasBlockRenderer for table/list styling', () => {
    const out = sanitizeHtml('<table class="w-full border-collapse"><tr><td class="px-4 py-2">cell</td></tr></table>')
    expect(out).toContain('class="w-full border-collapse"')
    expect(out).toContain('class="px-4 py-2"')
  })

  it('preserves table structure produced by the content pipeline', () => {
    const out = sanitizeHtml('<table><thead><tr><th>H</th></tr></thead><tbody><tr><td>D</td></tr></tbody></table>')
    expect(out).toContain('<thead>')
    expect(out).toContain('<tbody>')
    expect(out).toContain('<th>H</th>')
    expect(out).toContain('<td>D</td>')
  })

  it('returns an empty string for empty/falsy input', () => {
    expect(sanitizeHtml('')).toBe('')
  })
})
