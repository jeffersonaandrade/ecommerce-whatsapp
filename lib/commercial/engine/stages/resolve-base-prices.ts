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
    (sum, line) => sum + line.unitPrice * line.quantity,
    0
  )
  const adjustments = lines.reduce(
    (sum, line) => sum + line.addonsUnitTotal * line.quantity,
    0
  )
  const merchandiseSubtotal = lines.reduce(
    (sum, line) => sum + line.lineMerchandiseTotal,
    0
  )

  if (lines.length > 0) {
    trace.append({
      stage: 'base',
      label: 'Preço base',
      amount: merchandiseBase,
    })
  }

  return {
    lines,
    merchandiseBase,
    adjustments,
    merchandiseSubtotal,
  }
}
