import { formatPrice } from '@/lib/formatters'
import { PurchaseIntent, PurchaseIntentLine } from '@/types/purchase-intent'

function formatPersonalizationLines(intentLine: PurchaseIntentLine): string[] {
  const p = intentLine.addons?.personalization
  if (!p) return []

  const lines = [
    `Nome na camisa: ${p.name.trim()}`,
    `Número: ${p.number.trim()}`,
  ]

  if (p.notes?.trim()) {
    lines.push(`Observação: ${p.notes.trim()}`)
  }

  const addonsExtra = intentLine.addonsExtra ?? 0
  if (addonsExtra > 0) {
    lines.push(`Taxa personalização: +${formatPrice(addonsExtra)}`)
  }

  return lines
}

function formatLineTotals(intentLine: PurchaseIntentLine): string {
  const addonsExtra = intentLine.addonsExtra ?? 0
  const productTotal = intentLine.lineMerchandiseTotal - addonsExtra

  if (addonsExtra > 0) {
    return [
      `Qtd: ${intentLine.quantity}`,
      `Produto: ${formatPrice(productTotal)}`,
      `Personalização: ${formatPrice(addonsExtra)}`,
      `Total linha: ${formatPrice(intentLine.lineMerchandiseTotal)}`,
    ].join(' | ')
  }

  return `Qtd: ${intentLine.quantity} | Subtotal: ${formatPrice(intentLine.lineMerchandiseTotal)}`
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
    lines.push(`• ${line.productName}`)
    lines.push(
      [
        line.size ? `Tamanho: ${line.size}` : null,
        line.color ? `Cor: ${line.color}` : null,
        line.sku ? `SKU: ${line.sku}` : null,
      ]
        .filter(Boolean)
        .join(' | ')
    )
    lines.push(...formatPersonalizationLines(line))
    lines.push(formatLineTotals(line))
    lines.push(line.productUrl, '')
  }

  const productSubtotal = intent.merchandiseSubtotal - intent.addonsSubtotal

  lines.push('— Resumo —')
  lines.push(`Subtotal produtos: ${formatPrice(productSubtotal)}`)

  if (intent.addonsSubtotal > 0) {
    lines.push(`Total personalização: ${formatPrice(intent.addonsSubtotal)}`)
  }

  if (intent.commercialDiscount > 0) {
    const label = intent.appliedRuleName
      ? `Desconto (${intent.appliedRuleName})`
      : 'Desconto'
    lines.push(`${label}: -${formatPrice(intent.commercialDiscount)}`)
  }

  lines.push(`Total: ${formatPrice(intent.cartTotal)}`, '', 'Aguardo retorno.')

  return lines.join('\n')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
