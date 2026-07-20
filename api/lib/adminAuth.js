'use strict'

const INSECURE_DEFAULT_USER = 'admin'
const INSECURE_DEFAULT_PASS = 'admin123'

/**
 * Resolves admin Basic Auth credentials from the environment.
 *
 * In production, ADMIN_USER/ADMIN_PASS must be set explicitly — falling back to
 * the documented defaults ("admin"/"admin123") would leave the CMS (arbitrary
 * blog post edits, log access, pipeline triggers) open to anyone who reads the
 * source. Outside production (local dev), the defaults are allowed so the API
 * still boots without extra setup, but callers are told so they can warn.
 */
function resolveAdminCredentials(env = process.env) {
  const user = env.ADMIN_USER || ''
  const pass = env.ADMIN_PASS || ''
  const usingDefaults = !user || !pass

  if (usingDefaults && env.NODE_ENV === 'production') {
    throw new Error(
      'ADMIN_USER and ADMIN_PASS must be set via environment variables in production — ' +
        'refusing to start with the insecure default credentials.'
    )
  }

  return {
    user: user || INSECURE_DEFAULT_USER,
    pass: pass || INSECURE_DEFAULT_PASS,
    usingDefaults,
  }
}

module.exports = { resolveAdminCredentials, INSECURE_DEFAULT_USER, INSECURE_DEFAULT_PASS }
