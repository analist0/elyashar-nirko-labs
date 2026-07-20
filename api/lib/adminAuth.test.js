import { describe, expect, it } from 'vitest'
import { resolveAdminCredentials } from './adminAuth'

describe('resolveAdminCredentials', () => {
  it('uses provided ADMIN_USER/ADMIN_PASS when set', () => {
    const result = resolveAdminCredentials({ ADMIN_USER: 'joseph', ADMIN_PASS: 'correct-horse-battery-staple' })
    expect(result).toEqual({ user: 'joseph', pass: 'correct-horse-battery-staple', usingDefaults: false })
  })

  it('falls back to insecure defaults outside production', () => {
    const result = resolveAdminCredentials({ NODE_ENV: 'development' })
    expect(result.user).toBe('admin')
    expect(result.pass).toBe('admin123')
    expect(result.usingDefaults).toBe(true)
  })

  it('falls back to insecure defaults when NODE_ENV is unset (local dev)', () => {
    const result = resolveAdminCredentials({})
    expect(result.usingDefaults).toBe(true)
  })

  it('throws in production when ADMIN_USER/ADMIN_PASS are both missing', () => {
    expect(() => resolveAdminCredentials({ NODE_ENV: 'production' })).toThrow(
      /ADMIN_USER and ADMIN_PASS must be set/
    )
  })

  it('throws in production when only ADMIN_PASS is missing', () => {
    expect(() =>
      resolveAdminCredentials({ NODE_ENV: 'production', ADMIN_USER: 'joseph' })
    ).toThrow(/ADMIN_USER and ADMIN_PASS must be set/)
  })

  it('throws in production when only ADMIN_USER is missing', () => {
    expect(() =>
      resolveAdminCredentials({ NODE_ENV: 'production', ADMIN_PASS: 'correct-horse-battery-staple' })
    ).toThrow(/ADMIN_USER and ADMIN_PASS must be set/)
  })

  it('does not throw in production when both are explicitly set', () => {
    const result = resolveAdminCredentials({
      NODE_ENV: 'production',
      ADMIN_USER: 'joseph',
      ADMIN_PASS: 'correct-horse-battery-staple',
    })
    expect(result.usingDefaults).toBe(false)
  })
})
