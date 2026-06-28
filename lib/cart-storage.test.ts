import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CART_STORAGE_KEY,
  loadCartItems,
  saveCartItems,
} from '@/lib/cart-storage'

function createLocalStorageMock() {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}

describe('cart-storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {} as Window)
    vi.stubGlobal('localStorage', createLocalStorageMock())
    localStorage.clear()
  })

  it('loadCartItems retorna [] quando localStorage vazio', () => {
    expect(loadCartItems()).toEqual([])
  })

  it('loadCartItems retorna [] para JSON inválido', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{ invalid')
    expect(loadCartItems()).toEqual([])
  })

  it('loadCartItems retorna [] quando não é array legado válido', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{"foo":[]}')
    expect(loadCartItems()).toEqual([])
  })

  it('loadCartItems filtra itens incompletos', () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { productId: '1', variationId: 'v1', quantity: 2 },
        { productId: '2', variationId: 'v2' },
        { productId: '3', quantity: 1 },
        { variationId: 'v4', quantity: 1 },
        { productId: '5', variationId: 'v5', quantity: 0 },
        { productId: '6', variationId: 'v6', quantity: -1 },
      ])
    )

    expect(loadCartItems()).toEqual([
      { productId: '1', variationId: 'v1', quantity: 2 },
    ])
  })

  it('saveCartItems e loadCartItems persistem formato v2', () => {
    saveCartItems([
      { productId: '1', variationId: 'v1', quantity: 3 },
      { productId: '2', variationId: 'v9', quantity: 1 },
    ])

    const raw = localStorage.getItem(CART_STORAGE_KEY)
    expect(raw).toBe(
      JSON.stringify({
        version: 2,
        items: [
          { productId: '1', variationId: 'v1', quantity: 3 },
          { productId: '2', variationId: 'v9', quantity: 1 },
        ],
      })
    )
    expect(loadCartItems()).toEqual([
      { productId: '1', variationId: 'v1', quantity: 3 },
      { productId: '2', variationId: 'v9', quantity: 1 },
    ])
  })

  it('loadCartItems aceita formato legado (array)', () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ productId: '1', variationId: 'v1', quantity: 2 }])
    )
    expect(loadCartItems()).toEqual([
      { productId: '1', variationId: 'v1', quantity: 2 },
    ])
  })

  it('persiste addons de personalização', () => {
    saveCartItems([
      {
        productId: '1',
        variationId: 'v1',
        quantity: 1,
        addons: { personalization: { name: 'JEFF', number: '10' } },
      },
    ])

    expect(loadCartItems()).toEqual([
      {
        productId: '1',
        variationId: 'v1',
        quantity: 1,
        addons: { personalization: { name: 'JEFF', number: '10' } },
      },
    ])
  })

  it('loadCartItems arredonda quantity para inteiro', () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ productId: '1', variationId: 'v1', quantity: 2.9 }])
    )

    expect(loadCartItems()).toEqual([
      { productId: '1', variationId: 'v1', quantity: 2 },
    ])
  })
})
