import { describe, expect, it } from 'vitest'
import {
  countUniqueImageUrls,
  IMPORT_CSV_MAX_BYTES,
  IMPORT_MAX_PRODUCTS,
} from './parse-limits'

describe('parse-limits', () => {
  it('conta URLs únicas entre produtos', () => {
    expect(
      countUniqueImageUrls([
        { images: ['https://cdn.example.com/a.jpg', 'https://cdn.example.com/b.jpg'] },
        { images: ['https://cdn.example.com/a.jpg'] },
      ])
    ).toBe(2)
  })

  it('exporta limites documentados', () => {
    expect(IMPORT_CSV_MAX_BYTES).toBe(2 * 1024 * 1024)
    expect(IMPORT_MAX_PRODUCTS).toBe(500)
  })
})
