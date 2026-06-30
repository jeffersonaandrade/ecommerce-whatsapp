/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { ProductMultiPicker } from './product-multi-picker'
import type { ProductPickerItem } from '@/lib/admin/product-picker-actions'

vi.mock('@/lib/admin/product-picker-actions', () => ({
  searchProductsForPickerAction: vi.fn(),
  getProductsForPickerByIdsAction: vi.fn(async (ids: string[]) => ({
    ok: true,
    items: ids.map(
      (id): ProductPickerItem => ({
        id,
        name: 'Produto com nome extremamente longo que não deve estourar o layout do card no mobile',
        sku: 'SKU-MUITO-LONGO-123456789',
        status: 'active',
      })
    ),
  })),
}))

describe('ProductMultiPicker layout', () => {
  beforeEach(() => {
    cleanup()
  })

  it('aplica classes de contenção no fieldset, chips e lista de resultados', async () => {
    render(
      <ProductMultiPicker value={['prod-1', 'prod-2']} onChange={vi.fn()} />
    )

    const fieldset = screen.getByTestId('product-multi-picker')
    expect(fieldset.className).toContain('w-full')
    expect(fieldset.className).toContain('max-w-full')
    expect(fieldset.className).toContain('min-w-0')
    expect(fieldset.className).toContain('overflow-hidden')

    await waitFor(() => {
      const chips = fieldset.querySelectorAll('ul li > span')
      expect(chips.length).toBeGreaterThan(0)
    })

    const chips = fieldset.querySelectorAll('ul li > span')
    for (const chip of chips) {
      expect(chip.className).toContain('max-w-full')
      expect(chip.className).toContain('min-w-0')
      expect(chip.querySelector('.truncate')).toBeTruthy()
    }
  })

  it('mantém input de busca com largura contida', () => {
    render(<ProductMultiPicker value={[]} onChange={vi.fn()} />)

    const input = screen.getByPlaceholderText('Buscar por nome ou SKU...')
    expect(input.className).toContain('w-full')
    expect(input.className).toContain('max-w-full')
    expect(input.className).toContain('min-w-0')
  })
})
