/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { ProductsSearchInput } from './products-search-input'

const mockPush = vi.fn()
const mockSearchParams = vi.hoisted(() => new URLSearchParams('page=2'))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

describe('ProductsSearchInput', () => {
  beforeEach(() => {
    cleanup()
    mockPush.mockReset()
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key))
    mockSearchParams.set('page', '2')
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('não reseta a paginação ao montar com valor inicial vazio', () => {
    render(<ProductsSearchInput initialValue="" />)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('reseta page ao alterar a busca', () => {
    const { getByRole } = render(<ProductsSearchInput initialValue="" />)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    mockPush.mockReset()

    fireEvent.change(getByRole('searchbox'), { target: { value: 'milan' } })

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(mockPush).toHaveBeenCalledWith('/products?q=milan')
  })
})
