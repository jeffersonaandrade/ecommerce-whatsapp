import type { CommercialTrace, CommercialTraceEntry } from './types'

export type TraceBuilder = {
  trace: CommercialTrace
  append: (entry: Omit<CommercialTraceEntry, 'sequence'>) => void
}

export function createTraceBuilder(): TraceBuilder {
  const trace: CommercialTrace = []
  let sequence = 0

  return {
    trace,
    append(entry) {
      sequence += 1
      trace.push({ ...entry, sequence })
    },
  }
}
