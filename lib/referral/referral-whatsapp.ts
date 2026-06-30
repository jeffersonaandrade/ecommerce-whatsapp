import { buildWhatsAppUrl } from '@/lib/purchase-intent/build-whatsapp-message'

export const REFERRAL_WHATSAPP_MESSAGE =
  'Olá! Quero indicar uma loja para conhecer a plataforma.'

export function getSupportPhoneFromEnv(): string | undefined {
  const raw = process.env.NUMERO_DE_TELEFONE?.trim()
  if (!raw) return undefined
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 10 ? digits : undefined
}

export function getReferralWhatsAppUrl(): string | undefined {
  const phone = getSupportPhoneFromEnv()
  if (!phone) return undefined
  return buildWhatsAppUrl(phone, REFERRAL_WHATSAPP_MESSAGE)
}
