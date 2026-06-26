/**
 * Utilitários para entrada/exibição de valores em BRL no admin.
 * Persistência continua sendo number em reais (ex.: 129.9).
 */

const BRL_DISPLAY = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatBrlMoneyInput(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return ''
  return BRL_DISPLAY.format(value)
}

/**
 * Converte string digitada/colada para reais.
 * - "129,90" / "R$ 129,90" => 129.9
 * - "129.90" => 129.9
 * - Somente dígitos ("12990") => centavos => 129.9 (evita gravar 12990 reais)
 */
export function parseBrlMoney(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let normalized = trimmed
    .replace(/\u00a0/g, ' ')
    .replace(/R\$\s?/gi, '')
    .trim()

  const hasComma = normalized.includes(',')
  const hasDot = normalized.includes('.')

  if (!hasComma && !hasDot) {
    const digits = normalized.replace(/\D/g, '')
    if (!digits) return null
    const cents = Number(digits)
    return Number.isFinite(cents) ? cents / 100 : null
  }

  normalized = normalized.replace(/[^\d,.-]/g, '')

  if (hasComma && hasDot) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    normalized = normalized.replace(',', '.')
  } else if (hasDot) {
    const parts = normalized.split('.')
    const last = parts[parts.length - 1] ?? ''
    if (parts.length > 2 || last.length === 3) {
      normalized = normalized.replace(/\./g, '')
    }
  }

  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

export function reaisToCentsDigits(reais: number): string {
  if (!Number.isFinite(reais) || reais < 0) return ''
  return String(Math.round(reais * 100))
}
