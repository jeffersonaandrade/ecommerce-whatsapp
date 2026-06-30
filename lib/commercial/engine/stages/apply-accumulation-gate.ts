import type { CommercialTraceStage } from '../types'
import type { TraceBuilder } from '../trace-builder'

export function appendSkippedStageTrace(
  trace: TraceBuilder,
  stage: CommercialTraceStage,
  label: string,
  reason: string,
  metadata?: Record<string, unknown>
): void {
  trace.append({
    stage,
    label,
    amount: 0,
    status: 'skipped',
    skipReason: reason,
    metadata,
  })
}
