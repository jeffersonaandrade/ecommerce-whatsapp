import { ProductInput } from '@/lib/catalog/product-repository'

export type CsvErrorCode =
  | 'CSV_E001'
  | 'CSV_E002'
  | 'CSV_E003'
  | 'CSV_E004'
  | 'CSV_E005'
  | 'CSV_E006'
  | 'CSV_E007'

export type ImportIssue = {
  code: CsvErrorCode
  severity: 'error' | 'warning'
  row?: number
  slug?: string
  message: string
}

export type CsvRow = Record<string, string> & { __rowNumber: number }

export type ParsedVariation = {
  rowNumber: number
  sku: string
  stock: number
  size?: string
  color?: string
}

export type ParsedProduct = {
  slug: string
  name: string
  category: string
  price: number
  promotionalPrice?: number
  longDescription: string
  brand?: string
  images: string[]
  variations: ParsedVariation[]
  rowNumbers: number[]
}

export type ImportPreview = {
  fileName: string
  products: ParsedProduct[]
  issues: ImportIssue[]
  stats: {
    totalRows: number
    totalProducts: number
    validProducts: number
    errorCount: number
    warningCount: number
  }
}

export type ImportApplyResult = {
  created: number
  updated: number
  skipped: number
}

export type ImportProductInput = ProductInput & { slug: string }
