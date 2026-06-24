import { formatPrice } from '@/lib/formatters'
import { PurchaseIntent } from '@/types/purchase-intent'

export function buildWhatsAppMessage(intent: PurchaseIntent): string {
  const lines: string[] = [
    'Olá! Gostaria de solicitar este pedido.',
    '',
  ]

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
      `Qtd: ${line.quantity} | Subtotal: ${formatPrice(line.lineSubtotal)}`,
      line.productUrl,
    ].filter(Boolean)

    lines.push(...parts, '')
  }

  lines.push(`Total: ${formatPrice(intent.cartTotal)}`, '', 'Aguardo retorno.')

  return lines.join('\n')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
