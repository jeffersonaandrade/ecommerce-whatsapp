import type { FreightStageResult } from '../types'
import type { TraceBuilder } from '../trace-builder'
import type { ResolvedAccumulation } from '../resolve-accumulation'
import { appendSkippedStageTrace } from './apply-accumulation-gate'

/** Fase 1: frete negociado no WhatsApp — sem cálculo */
export function calculateFreight(
  trace: TraceBuilder,
  hasLines: boolean,
  allowFreight = true,
  accumulation?: ResolvedAccumulation
): FreightStageResult {
  if (!hasLines) {
    return { freight: null }
  }

  if (!allowFreight) {
    appendSkippedStageTrace(
      trace,
      'freight',
      'Frete',
      'Canal ou política bloqueia acumulação de frete',
      {
        source: accumulation?.source,
        policyId: accumulation?.policyId,
      }
    )
    return { freight: null }
  }

  trace.append({
    stage: 'freight',
    label: 'Frete negociado no WhatsApp',
    amount: 0,
    status: 'applied',
  })

  return { freight: null }
}
