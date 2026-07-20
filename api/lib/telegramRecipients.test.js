import { describe, expect, it } from 'vitest'
import { resolveTelegramRecipients, filterRecipientsByTarget } from './telegramRecipients'

describe('resolveTelegramRecipients', () => {
  it('returns an empty array when nothing is configured', () => {
    expect(resolveTelegramRecipients({})).toEqual([])
  })

  it('falls back to the single TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID pair', () => {
    const result = resolveTelegramRecipients({
      TELEGRAM_BOT_TOKEN: 'abc:123',
      TELEGRAM_CHAT_ID: '555',
    })
    expect(result).toEqual([{ token: 'abc:123', chatId: '555', name: '', id: '' }])
  })

  it('prefers TELEGRAM_RECIPIENTS over the single-pair fallback', () => {
    const result = resolveTelegramRecipients({
      TELEGRAM_BOT_TOKEN: 'ignored:token',
      TELEGRAM_CHAT_ID: 'ignored',
      TELEGRAM_RECIPIENTS: JSON.stringify([
        { token: 'a:1', chatId: '1', name: 'Alice' },
        { token: 'b:2', chatId: '2', name: 'Bob' },
      ]),
    })
    expect(result).toEqual([
      { token: 'a:1', chatId: '1', name: 'Alice', id: '' },
      { token: 'b:2', chatId: '2', name: 'Bob', id: '' },
    ])
  })

  it('drops malformed entries missing token or chatId', () => {
    const result = resolveTelegramRecipients({
      TELEGRAM_RECIPIENTS: JSON.stringify([
        { token: 'a:1', chatId: '1' },
        { chatId: 'no-token' },
        { token: 'no-chat-id' },
        null,
      ]),
    })
    expect(result).toEqual([{ token: 'a:1', chatId: '1', name: '', id: '' }])
  })

  it('returns an empty array (not a throw) for invalid JSON', () => {
    expect(resolveTelegramRecipients({ TELEGRAM_RECIPIENTS: '{not valid json' })).toEqual([])
  })

  it('returns an empty array for a non-array JSON value', () => {
    expect(resolveTelegramRecipients({ TELEGRAM_RECIPIENTS: '{"token":"a"}' })).toEqual([])
  })

  it('carries through an optional id field for targeting a single recipient', () => {
    const result = resolveTelegramRecipients({
      TELEGRAM_RECIPIENTS: JSON.stringify([{ token: 'a:1', chatId: '1', id: 'joseph' }]),
    })
    expect(result).toEqual([{ token: 'a:1', chatId: '1', name: '', id: 'joseph' }])
  })
})

describe('filterRecipientsByTarget', () => {
  const recipients = [
    { token: 'a:1', chatId: '1', name: 'Joseph', id: 'joseph' },
    { token: 'b:2', chatId: '2', name: 'Michael', id: 'michael' },
  ]

  it('returns everyone when no target is given', () => {
    expect(filterRecipientsByTarget(recipients, '')).toEqual(recipients)
  })

  it('returns everyone for "both"', () => {
    expect(filterRecipientsByTarget(recipients, 'both')).toEqual(recipients)
  })

  it('narrows to the matching id', () => {
    expect(filterRecipientsByTarget(recipients, 'joseph')).toEqual([recipients[0]])
  })

  it('falls back to everyone when the target matches nobody', () => {
    expect(filterRecipientsByTarget(recipients, 'nonexistent-partner')).toEqual(recipients)
  })
})
