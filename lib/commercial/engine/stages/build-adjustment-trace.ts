import type { TraceBuilder } from '../trace-builder'

export function buildAdjustmentTrace(
  adjustments: number,
  trace: TraceBuilder
): void {
  if (adjustments <= 0) return

  trace.append({
    stage: 'adjustment',
    label: 'Personalização',
    amount: adjustments,
  })
}
