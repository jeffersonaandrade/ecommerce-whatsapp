import type { FreightStageResult } from '../types'
import type { TraceBuilder } from '../trace-builder'

/** Fase 1: frete negociado no WhatsApp — sem cálculo */
export function calculateFreight(
  trace: TraceBuilder,
  hasLines: boolean
): FreightStageResult {
  if (hasLines) {
    trace.append({
      stage: 'freight',
      label: 'Frete negociado no WhatsApp',
      amount: 0,
    })
  }

  return { freight: null }
}
