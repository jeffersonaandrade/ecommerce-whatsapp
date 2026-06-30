/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CouponForm } from './coupon-form'
import type { Category } from '@/types/category'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockCreateCouponRuleAction = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

vi.mock('@/lib/commercial/commercial-coupon-actions', () => ({
  createCouponRuleAction: (...args: unknown[]) => mockCreateCouponRuleAction(...args),
  updateCouponRuleAction: vi.fn(),
}))

vi.mock('@/lib/admin/product-picker-actions', () => ({
  searchProductsForPickerAction: vi.fn(async () => ({
    ok: true,
    items: [
      {
        id: 'prod-1',
        name: 'Camisa Pro',
        sku: 'CAM-001',
        status: 'active',
      },
    ],
  })),
  getProductsForPickerByIdsAction: vi.fn(async (ids: string[]) => ({
    ok: true,
    items: ids.map((id) => ({
      id,
      name: 'Camisa Pro',
      sku: 'CAM-001',
      status: 'active' as const,
    })),
  })),
}))

const categories: Category[] = [
  {
    id: 'cat-shirts',
    name: 'Camisetas',
    slug: 'camisetas',
    parentId: null,
    depth: 0,
    path: 'camisetas',
    sortOrder: 0,
    visible: true,
    createdAt: '',
    updatedAt: '',
  },
]

describe('CouponForm', () => {
  beforeEach(() => {
    cleanup()
    mockPush.mockReset()
    mockRefresh.mockReset()
    mockCreateCouponRuleAction.mockReset()
    mockCreateCouponRuleAction.mockResolvedValue({ ok: true, id: 'coupon-1' })
  })

  it('salva productIds e categoryIds sem exigir UUID manual', async () => {
    const user = userEvent.setup()

    render(<CouponForm mode="create" categories={categories} />)

    await user.type(screen.getByPlaceholderText('Ex.: Bem-vindo 10%'), 'Cupom teste')
    await user.type(screen.getByPlaceholderText('BEMVINDO10'), 'TESTE10')
    await user.type(screen.getByRole('spinbutton', { name: /valor do desconto/i }), '10')

    await user.click(screen.getByLabelText(/Camisetas/i))

    await user.type(screen.getByPlaceholderText('Buscar por nome ou SKU...'), 'Camisa')
    await waitFor(
      () => {
        expect(screen.getByText('Camisa Pro')).toBeTruthy()
      },
      { timeout: 1000 }
    )
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))

    await user.click(screen.getByRole('button', { name: 'Criar cupom' }))

    await waitFor(() => {
      expect(mockCreateCouponRuleAction).toHaveBeenCalled()
    })

    const payload = mockCreateCouponRuleAction.mock.calls[0][0]
    expect(payload.conditions.categoryIds).toEqual(['cat-shirts'])
    expect(payload.conditions.productIds).toEqual(['prod-1'])
  })
})
