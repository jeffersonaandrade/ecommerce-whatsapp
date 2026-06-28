import { formatPrice } from '@/lib/formatters'
import { PurchaseIntent } from '@/types/purchase-intent'

function formatAddonsLine(intentLine: PurchaseIntent['lines'][number]): string | null {
  const p = intentLine.addons?.personalization
  if (!p) return null
  const parts = [`Nome: ${p.name}`, `Nº: ${p.number}`]
  if (p.notes?.trim()) parts.push(`Obs: ${p.notes.trim()}`)
  return parts.join(' | ')
}

export function buildWhatsAppMessage(
  intent: PurchaseIntent,
  prefix = ''
): string {
  const lines: string[] = []

  if (prefix.trim()) {
    lines.push(prefix.trim(), '')
  }

  lines.push('Olá! Gostaria de solicitar este pedido.', '', `Pedido #${intent.id}`, '')

  for (const line of intent.lines) {
    const parts = [
      `• ${line.productName}`,
      [
        line.size ? `Tamanho: ${line.size}` : null,
        line.color ? `Cor: ${line.color}` : null,
        line.sku ? `SKU: ${line.sku}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
      formatAddonsLine(line),
      `Qtd: ${line.quantity} | Subtotal: ${formatPrice(line.lineMerchandiseTotal)}`,
      line.productUrl,
    ].filter(Boolean) as string[]

    lines.push(...parts, '')
  }

  if (intent.addonsSubtotal > 0) {
    lines.push(`Personalização: ${formatPrice(intent.addonsSubtotal)}`, '')
  }

  if (intent.commercialDiscount > 0) {
    const label = intent.appliedRuleName
      ? `Desconto (${intent.appliedRuleName})`
      : 'Desconto'
    lines.push(`${label}: -${formatPrice(intent.commercialDiscount)}`, '')
  }

  lines.push(`Total: ${formatPrice(intent.cartTotal)}`, '', 'Aguardo retorno.')

  return lines.join('\n')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
