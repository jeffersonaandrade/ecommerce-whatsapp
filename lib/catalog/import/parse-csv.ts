import { CsvRow } from './types'

export function parseCsv(text: string): string[][] {
  const normalized = text.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i]
    const next = normalized[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ',') {
      row.push(field)
      field = ''
      continue
    }

    if (char === '\n') {
      row.push(field)
      field = ''
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row)
      }
      row = []
      continue
    }

    if (char === '\r') continue

    field += char
  }

  row.push(field)
  if (row.some((cell) => cell.trim() !== '')) {
    rows.push(row)
  }

  return rows
}

export function csvToRecords(text: string): CsvRow[] {
  const matrix = parseCsv(text)
  if (matrix.length === 0) return []

  const headers = matrix[0].map((h) => h.trim())
  const records: CsvRow[] = []

  for (let i = 1; i < matrix.length; i++) {
    const cells = matrix[i]
    const record = { __rowNumber: i + 1 } as CsvRow
    headers.forEach((header, index) => {
      record[header] = (cells[index] ?? '').trim()
    })
    records.push(record)
  }

  return records
}
