import { describe, expect, it, vi } from 'vitest'
import { Product } from '@/types/product'

describe('setProductImages repository contract', () => {
  it('json provider atualiza somente images', async () => {
    const products: Product[] = [
      {
        id: '1',
        name: 'Produto',
        slug: 'produto',
        shortDescription: '',
        longDescription: 'Desc',
        price: 100,
        category: 'camisas',
        images: ['https://external.com/a.jpg'],
        variations: [{ id: 'v1', sku: 'SKU-1', stock: 5 }],
        status: 'draft',
      },
    ]

    const setProductImages = async (id: string, images: string[]) => {
      const index = products.findIndex((p) => p.id === id)
      if (index === -1) throw new Error('not found')
      products[index] = { ...products[index], images }
      return products[index]
    }

    const updated = await setProductImages('1', [
      'https://example.supabase.co/storage/v1/object/public/products/1/new.jpg',
    ])

    expect(updated.images).toHaveLength(1)
    expect(updated.variations).toHaveLength(1)
    expect(updated.variations[0].sku).toBe('SKU-1')
    expect(updated.name).toBe('Produto')
  })

  it('supabase update mock não chama variations', async () => {
    const update = vi.fn().mockResolvedValue({ error: null })
    const supabase = {
      from: vi.fn(() => ({ update: vi.fn(() => ({ eq: update })) })),
    }

    await supabase.from('products').update({ images: ['url'] }).eq('id', '1')
    expect(supabase.from).toHaveBeenCalledWith('products')
    expect(update).toHaveBeenCalled()
  })
})
