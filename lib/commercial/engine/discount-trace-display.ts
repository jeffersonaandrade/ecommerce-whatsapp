import type { CommercialTrace, CommercialTraceStage } from './types'

export type CartDiscountLine = {
  stage: Extract<CommercialTraceStage, 'policy' | 'rule'>
  label: string
  amount: number
}

export type CartDiscountDisplay = {
  lines: CartDiscountLine[]
  total: number
}

function formatDiscountLabel(
  stage: CartDiscountLine['stage'],
  traceLabel: string,
  source?: string
): string {
  if (source === 'coupon') return traceLabel.startsWith('Cupom') ? traceLabel : `Cupom: ${traceLabel}`
  if (stage === 'policy') return `Política comercial: ${traceLabel}`
  return `Promoção: ${traceLabel}`
}

export function getCartDiscountDisplay(trace: CommercialTrace = []): CartDiscountDisplay {
  const lines: CartDiscountLine[] = trace
    .filter(
      (entry): entry is typeof entry & { stage: CartDiscountLine['stage'] } =>
        (entry.stage === 'policy' || entry.stage === 'rule') &&
        entry.amount < 0 &&
        entry.status !== 'skipped'
    )
    .sort((a, b) => a.sequence - b.sequence)
    .map((entry) => ({
      stage: entry.stage,
      label: formatDiscountLabel(entry.stage, entry.label, entry.source),
      amount: Math.abs(entry.amount),
    }))

  const total = lines.reduce((sum, line) => sum + line.amount, 0)

  return { lines, total }
}
