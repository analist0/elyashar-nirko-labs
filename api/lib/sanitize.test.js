import { describe, expect, it } from 'vitest'
import { sanitizeText, escapeHtml, clampLength } from './sanitize'

describe('sanitizeText', () => {
  it('strips script tags', () => {
    expect(sanitizeText('hi <script>alert(1)</script> there')).toBe('hi  there')
  })

  it('strips javascript: URLs', () => {
    expect(sanitizeText('click javascript:alert(1) now')).toBe('click alert(1) now')
  })

  it('strips the "onclick=" attribute name (value is not HTML-parsed, so it is left inert as text)', () => {
    expect(sanitizeText('<div onclick="alert(1)">hi</div>')).toBe('<div "alert(1)">hi</div>')
  })

  it('strips iframe/object/embed tag openings', () => {
    expect(sanitizeText('<iframe src=x></iframe>')).not.toContain('<iframe')
    expect(sanitizeText('<object data=x>')).not.toContain('<object')
    expect(sanitizeText('<embed src=x>')).not.toContain('<embed')
  })

  it('leaves plain text untouched (besides trimming)', () => {
    expect(sanitizeText('  hello world  ')).toBe('hello world')
  })

  it('returns an empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('')
    expect(sanitizeText(undefined)).toBe('')
    expect(sanitizeText(42)).toBe('')
  })
})

describe('escapeHtml', () => {
  it('escapes the five reserved HTML characters', () => {
    expect(escapeHtml(`<a href="x">it's & "safe"</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;it&#39;s &amp; &quot;safe&quot;&lt;/a&gt;'
    )
  })

  it('returns an empty string for non-string input', () => {
    expect(escapeHtml(null)).toBe('')
  })
})

describe('clampLength', () => {
  it('truncates to the given max length', () => {
    expect(clampLength('a'.repeat(10), 5)).toBe('aaaaa')
  })

  it('trims whitespace after truncation', () => {
    expect(clampLength('hello      ', 7)).toBe('hello')
  })

  it('leaves short strings untouched', () => {
    expect(clampLength('hi', 100)).toBe('hi')
  })

  it('returns an empty string for non-string input', () => {
    expect(clampLength(null, 10)).toBe('')
  })
})
