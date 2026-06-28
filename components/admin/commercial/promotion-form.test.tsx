/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromotionForm } from './promotion-form'
import { CommercialRule } from '@/types/commercial-rule'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockCreateCommercialRuleAction = vi.fn()
const mockUpdateCommercialRuleAction = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

vi.mock('@/lib/commercial/commercial-actions', () => ({
  createCommercialRuleAction: (...args: unknown[]) =>
    mockCreateCommercialRuleAction(...args),
  updateCommercialRuleAction: (...args: unknown[]) =>
    mockUpdateCommercialRuleAction(...args),
}))

const baseRule: CommercialRule = {
  id: 'rule-1',
  kind: 'promotion',
  name: 'Leve 3',
  type: 'quantity_discount',
  status: 'active',
  priority: 10,
  stackable: false,
  appliesTo: 'all_products',
  config: { requiredQuantity: 3, discountAmount: 50 },
  createdAt: '',
  updatedAt: '',
}

describe('PromotionForm', () => {
  beforeEach(() => {
    cleanup()
    mockPush.mockReset()
    mockRefresh.mockReset()
    mockCreateCommercialRuleAction.mockReset()
    mockUpdateCommercialRuleAction.mockReset()
  })

  it('exibe status em português no select', () => {
    render(<PromotionForm mode="edit" rule={baseRule} />)

    expect(screen.getByRole('option', { name: 'Rascunho' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Agendada' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Ativa' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Expirada' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Arquivada' })).toBeTruthy()
  })

  it('mostra sucesso após salvar edição', async () => {
    mockUpdateCommercialRuleAction.mockResolvedValue({ ok: true })
    const user = userEvent.setup()

    render(<PromotionForm mode="edit" rule={baseRule} />)
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => {
      expect(screen.getByText('Promoção salva com sucesso.')).toBeTruthy()
    })
  })

  it('mostra erro quando update falha', async () => {
    mockUpdateCommercialRuleAction.mockResolvedValue({
      ok: false,
      error: 'Falha ao atualizar promoção.',
    })
    const user = userEvent.setup()

    render(<PromotionForm mode="edit" rule={baseRule} />)
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => {
      expect(screen.getByText('Falha ao atualizar promoção.')).toBeTruthy()
    })
  })

  it('redireciona com ?created=1 após criar promoção', async () => {
    mockCreateCommercialRuleAction.mockResolvedValue({ ok: true, id: 'rule-new' })
    const user = userEvent.setup()

    render(<PromotionForm mode="create" />)

    await user.type(screen.getByPlaceholderText('Ex.: Leve 3 com desconto'), 'Nova promo')
    await user.type(screen.getByLabelText('Valor do desconto por grupo *'), '5000')
    await user.click(screen.getByRole('button', { name: 'Criar promoção' }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/admin/comercial/promocoes/rule-new?created=1'
      )
    })
  })
})
