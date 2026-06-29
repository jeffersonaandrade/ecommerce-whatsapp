import { describe, expect, it } from 'vitest'
import {
  BULK_MOVE_CONFIRM_THRESHOLD,
  hasAnyAdminFilter,
  isCatalogWideFilter,
} from './admin-product-filters'

describe('admin-product-filters', () => {
  it('detecta filtros ativos', () => {
    expect(hasAnyAdminFilter({})).toBe(false)
    expect(hasAnyAdminFilter({ status: ['draft'] })).toBe(true)
    expect(hasAnyAdminFilter({ batchId: 'batch-1' })).toBe(true)
    expect(hasAnyAdminFilter({ category: 'camisas' })).toBe(true)
  })

  it('identifica operação no catálogo inteiro', () => {
    expect(isCatalogWideFilter({}, 100, 100)).toBe(true)
    expect(isCatalogWideFilter({ status: ['draft'] }, 50, 100)).toBe(false)
  })

  it('expõe limiar de confirmação', () => {
    expect(BULK_MOVE_CONFIRM_THRESHOLD).toBe(50)
  })
})
