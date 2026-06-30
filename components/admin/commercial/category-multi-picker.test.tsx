/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryMultiPicker } from './category-multi-picker'
import type { Category } from '@/types/category'

const categories: Category[] = [
  {
    id: 'cat-root',
    name: 'Vestuário',
    slug: 'vestuario',
    parentId: null,
    depth: 0,
    path: 'vestuario',
    sortOrder: 0,
    visible: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat-shirts',
    name: 'Camisetas',
    slug: 'camisetas',
    parentId: 'cat-root',
    depth: 1,
    path: 'vestuario/camisetas',
    sortOrder: 0,
    visible: true,
    createdAt: '',
    updatedAt: '',
  },
]

describe('CategoryMultiPicker', () => {
  beforeEach(() => {
    cleanup()
  })

  it('exibe nomes legíveis e mantém ids selecionados', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <CategoryMultiPicker
        categories={categories}
        value={[]}
        onChange={onChange}
      />
    )

    await user.click(screen.getByLabelText(/Camisetas/i))
    expect(onChange).toHaveBeenCalledWith(['cat-shirts'])
  })

  it('filtra categorias pela busca', async () => {
    const user = userEvent.setup()

    render(
      <CategoryMultiPicker
        categories={categories}
        value={[]}
        onChange={vi.fn()}
      />
    )

    await user.type(screen.getByPlaceholderText('Buscar categoria...'), 'camis')
    expect(screen.getAllByText(/Camisetas/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/^Vestuário$/)).toBeNull()
  })

  it('mostra chip da categoria selecionada', () => {
    render(
      <CategoryMultiPicker
        categories={categories}
        value={['cat-shirts']}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Remover Camisetas')).toBeTruthy()
  })
})
