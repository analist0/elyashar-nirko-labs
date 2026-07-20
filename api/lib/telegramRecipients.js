'use strict'

/**
 * Resolves who gets notified when the site chat widget / lead form fires.
 *
 * TELEGRAM_RECIPIENTS (preferred) is a JSON array of { token, chatId, name?, id? },
 * letting multiple bots/owners be notified — e.g. two partners each with their
 * own bot. `id` is an optional machine-readable key (e.g. "joseph"/"michael")
 * used to target a single recipient (see filterRecipientsByTarget below).
 * Falls back to the single TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID pair (already
 * used by /chat and /lead) if TELEGRAM_RECIPIENTS isn't set, so existing
 * single-bot deployments keep working unchanged.
 *
 * Bot tokens must only ever live here (server-side env vars) — never in
 * client-side code, which ships to every visitor's browser as plain text.
 */
function resolveTelegramRecipients(env = process.env) {
  if (env.TELEGRAM_RECIPIENTS) {
    try {
      const parsed = JSON.parse(env.TELEGRAM_RECIPIENTS)
      if (!Array.isArray(parsed)) throw new Error('TELEGRAM_RECIPIENTS must be a JSON array')
      return parsed
        .filter((r) => r && typeof r.token === 'string' && typeof r.chatId === 'string')
        .map((r) => ({ token: r.token, chatId: r.chatId, name: r.name || '', id: r.id || '' }))
    } catch (err) {
      console.error('Invalid TELEGRAM_RECIPIENTS env var, ignoring:', err.message)
      return []
    }
  }

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    return [{ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, name: '', id: '' }]
  }

  return []
}

/**
 * Narrows the recipient list to a single `id` (e.g. a partner picked in a
 * contact form). Falls back to the full list when no target is given, the
 * target is "both"/"all", or nothing matches (so an unrecognized target still
 * notifies someone rather than silently notifying no one).
 */
function filterRecipientsByTarget(recipients, target) {
  if (!target || target === 'both' || target === 'all') return recipients
  const matched = recipients.filter((r) => r.id === target)
  return matched.length > 0 ? matched : recipients
}

module.exports = { resolveTelegramRecipients, filterRecipientsByTarget }
