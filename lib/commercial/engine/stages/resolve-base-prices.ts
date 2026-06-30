import { resolveLinePrices } from '@/lib/pricing/resolve-line-price'
import type { CommercialEngineInput, BasePricesStageResult } from '../types'
import type { TraceBuilder } from '../trace-builder'

export function resolveBasePrices(
  input: CommercialEngineInput,
  trace: TraceBuilder
): BasePricesStageResult {
  const lineContext = {
    getProductById: input.getProductById,
    personalizationSettings: input.personalizationSettings,
  }

  const lines = resolveLinePrices(input.items, lineContext)
  const merchandiseBase = lines.reduce(
    (sum, line) => sum + line.lineProductSubtotal,
    0
  )
  const adjustments = lines.reduce(
    (sum, line) => sum + line.lineAdjustmentTotal,
    0
  )
  const merchandiseSubtotal = lines.reduce(
    (sum, line) => sum + line.lineMerchandiseTotal,
    0
  )
  const displaySubtotal = merchandiseSubtotal
  const merchandiseDiscountBase = merchandiseBase

  if (lines.length > 0) {
    trace.append({
      stage: 'base',
      label: 'Preço base',
      amount: merchandiseBase,
      status: 'applied',
      metadata: {
        displaySubtotal,
        adjustments,
      },
    })
  }

  return {
    lines,
    merchandiseBase,
    adjustments,
    merchandiseSubtotal,
    displaySubtotal,
    merchandiseDiscountBase,
  }
}
