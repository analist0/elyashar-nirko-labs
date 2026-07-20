'use strict'

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

module.exports = { sanitizeText, escapeHtml, clampLength }
