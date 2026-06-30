import { afterEach, describe, expect, it } from 'vitest'
import {
  REFERRAL_WHATSAPP_MESSAGE,
  getReferralWhatsAppUrl,
  getSupportPhoneFromEnv,
} from './referral-whatsapp'

describe('referral whatsapp', () => {
  const originalPhone = process.env.NUMERO_DE_TELEFONE

  afterEach(() => {
    if (originalPhone === undefined) {
      delete process.env.NUMERO_DE_TELEFONE
    } else {
      process.env.NUMERO_DE_TELEFONE = originalPhone
    }
  })

  it('normaliza NUMERO_DE_TELEFONE da env', () => {
    process.env.NUMERO_DE_TELEFONE = '+55 (81) 99256-8647'
    expect(getSupportPhoneFromEnv()).toBe('5581992568647')
  })

  it('monta link wa.me com mensagem de indicação', () => {
    process.env.NUMERO_DE_TELEFONE = '5581992568647'
    const url = getReferralWhatsAppUrl()
    expect(url).toContain('https://wa.me/5581992568647')
    expect(url).toContain(encodeURIComponent(REFERRAL_WHATSAPP_MESSAGE))
  })

  it('retorna undefined sem telefone válido', () => {
    process.env.NUMERO_DE_TELEFONE = '123'
    expect(getReferralWhatsAppUrl()).toBeUndefined()
  })
})
