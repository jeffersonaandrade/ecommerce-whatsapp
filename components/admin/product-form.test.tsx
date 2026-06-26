/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductForm } from './product-form'
import { Category } from '@/types/category'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockCreateProductAction = vi.fn()
const mockUpdateProductAction = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

vi.mock('@/lib/auth/mode', () => ({
  isSupabaseAuthMode: () => false,
}))

vi.mock('@/lib/catalog/actions', () => ({
  createProductAction: (...args: unknown[]) => mockCreateProductAction(...args),
  updateProductAction: (...args: unknown[]) => mockUpdateProductAction(...args),
}))

vi.mock('@/components/admin/image-gallery-field', () => ({
  ImageGalleryField: ({
    onChange,
  }: {
    onChange: (images: string[]) => void
  }) => {
    const { useEffect } = require('react')
    useEffect(() => {
      onChange(['https://example.com/test-product.jpg'])
    }, [onChange])
    return null
  },
}))

vi.mock('next/image', () => ({
  default: () => null,
}))

const categories: Category[] = [
  {
    id: '1',
    name: 'Camisas',
    slug: 'camisas',
    description: '',
    sortOrder: 20,
    visible: true,
    createdAt: '',
    updatedAt: '',
  },
]

describe('ProductForm create flow', () => {
  beforeEach(() => {
    cleanup()
    mockPush.mockReset()
    mockRefresh.mockReset()
    mockCreateProductAction.mockReset()
    mockUpdateProductAction.mockReset()
  })

  it('redireciona para edit com ?created=1 após create ok', async () => {
    mockCreateProductAction.mockResolvedValue({ ok: true, id: 'prod-99' })
    const user = userEvent.setup()

    render(<ProductForm mode="create" categories={categories} />)

    await user.type(screen.getByLabelText('Nome *'), 'Camisa Teste UX')
    await user.type(screen.getByLabelText('Preço'), '129,90')
    await user.type(screen.getByLabelText('Descrição *'), 'Descrição de teste')
    await user.type(screen.getByLabelText('SKU *'), 'SKU-UX-UNIQUE-001')

    await user.click(screen.getByRole('button', { name: 'Criar produto' }))

    await waitFor(() => {
      expect(mockCreateProductAction).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/admin/products/prod-99/edit?created=1')
    })

    const payload = mockCreateProductAction.mock.calls[0][0]
    expect(payload.price).toBe(129.9)
  })

  it('exibe erro com role alert quando create falha', async () => {
    mockCreateProductAction.mockResolvedValue({
      ok: false,
      errors: [{ field: 'variations', message: 'SKU "dup" já existe no catálogo' }],
    })
    const user = userEvent.setup()

    render(<ProductForm mode="create" categories={categories} />)

    await user.type(screen.getByLabelText('Nome *'), 'Produto Dup')
    await user.type(screen.getByLabelText('Preço'), 'R$ 50,00')
    await user.type(screen.getByLabelText('Descrição *'), 'Desc')
    await user.type(screen.getByLabelText('SKU *'), 'dup')

    await user.click(screen.getByRole('button', { name: 'Criar produto' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('SKU "dup" já existe no catálogo')
  })

  it('bloqueia submit no cliente quando faltam campos obrigatórios', async () => {
    const user = userEvent.setup()
    render(<ProductForm mode="create" categories={categories} />)

    await user.click(screen.getByRole('button', { name: 'Criar produto' }))

    expect(mockCreateProductAction).not.toHaveBeenCalled()
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toMatch(/Nome|Preço|Descrição|imagem|Variações/i)
  })
})
