import { describe, expect, it } from 'vitest'
import { resolveImportStatus, resolveImportStatusForPreview } from './resolve-import-status'
import type { Product } from '@/types/product'

const existingActive = { status: 'active' } as Product
const existingDraft = { status: 'draft' } as Product

describe('resolveImportStatus', () => {
  it('cria produto novo sempre como rascunho', () => {
    expect(resolveImportStatus({ statusFromCsv: 'active' }, undefined, 'active')).toBe('draft')
    expect(resolveImportStatus({}, undefined, 'draft')).toBe('draft')
  })

  it('preserva status em reimportação', () => {
    expect(resolveImportStatus({ statusFromCsv: 'active' }, existingActive, 'draft')).toBe('active')
    expect(resolveImportStatus({}, existingDraft, 'active')).toBe('draft')
  })

  it('permite rebaixar via CSV', () => {
    expect(resolveImportStatus({ statusFromCsv: 'draft' }, existingActive, 'active')).toBe('draft')
    expect(resolveImportStatus({ statusFromCsv: 'unavailable' }, existingActive, 'active')).toBe(
      'unavailable'
    )
  })
})

describe('resolveImportStatusForPreview', () => {
  it('espelha regras do apply', () => {
    expect(resolveImportStatusForPreview({ statusFromCsv: 'active' }, undefined, 'active')).toBe(
      'draft'
    )
    expect(resolveImportStatusForPreview({ statusFromCsv: 'active' }, 'active', 'draft')).toBe(
      'active'
    )
  })
})
